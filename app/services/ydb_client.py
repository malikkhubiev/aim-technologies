from __future__ import annotations
import asyncio
from typing import Any, Dict, List
from datetime import datetime
import ydb
import ydb.aio
from app.config import settings

class YdbClient:
	def __init__(self) -> None:
		self._driver: ydb.aio.Driver | None = None
		self._pool: ydb.aio.SessionPool | None = None
		self._fallback_store: List[Dict[str, Any]] = []  # in-memory fallback

	async def _ensure(self) -> None:
		# If no config provided, stay in fallback mode
		if not settings.ydb_endpoint or not settings.ydb_database:
			return
		if self._driver is None:
			try:
				self._driver = ydb.aio.Driver(
					endpoint=settings.ydb_endpoint,
					database=settings.ydb_database,
				)
				await self._driver.wait(fail_fast=True)
				self._pool = ydb.aio.SessionPool(self._driver, size=5)
			except Exception:
				# Stay in fallback mode
				self._driver = None
				self._pool = None

	async def upsert_interaction(
		self,
		interaction_id: str,
		channel: str,
		customer_phone: str,
		intent: str,
		result: str,
		sale: bool,
		amount: float,
		raw: Dict[str, Any],
		created_at: datetime,
	) -> None:
		await self._ensure()
		# Fallback: store locally if YDB is unavailable
		if self._pool is None:
			self._fallback_store.append({
				"interaction_id": interaction_id,
				"channel": channel,
				"customer_phone": customer_phone,
				"intent": intent,
				"result": result,
				"sale": sale,
				"amount": amount,
				"raw": raw,
				"created_at": created_at,
			})
			return
		query = (
			"PRAGMA TablePathPrefix(\"\");"
			"DECLARE $interaction_id AS Utf8;"
			"DECLARE $channel AS Utf8;"
			"DECLARE $customer_phone AS Utf8;"
			"DECLARE $intent AS Utf8;"
			"DECLARE $result AS Utf8;"
			"DECLARE $sale AS Bool;"
			"DECLARE $amount AS Double;"
			"DECLARE $raw AS Json;"
			"DECLARE $created_at AS Timestamp;"
			"UPSERT INTO interactions (interaction_id, channel, customer_phone, intent, result, sale, amount, raw, created_at) "
			"VALUES ($interaction_id, $channel, $customer_phone, $intent, $result, $sale, $amount, $raw, $created_at);"
		)
		params = {
			"$interaction_id": interaction_id,
			"$channel": channel,
			"$customer_phone": customer_phone,
			"$intent": intent,
			"$result": result,
			"$sale": sale,
			"$amount": amount,
			"$raw": ydb.Value.make_json(raw),
			"$created_at": ydb.Timestamp.from_datetime(created_at),
		}
		assert self._pool is not None
		async with self._pool.acquire() as session:
			await session.transaction().execute(query, params, commit_tx=True)

	async def list_interactions(self, limit: int = 20) -> List[Dict[str, Any]]:
		"""Return most recent interactions. Uses YDB when configured, otherwise fallback memory store."""
		await self._ensure()
		if self._pool is None:
			# Sort by created_at desc
			return sorted(self._fallback_store, key=lambda x: x.get("created_at"), reverse=True)[:limit]
		query = (
			"PRAGMA TablePathPrefix(\"\");"
			"DECLARE $limit AS Uint64;"
			"SELECT interaction_id, channel, customer_phone, intent, result, sale, amount, raw, created_at "
			"FROM interactions ORDER BY created_at DESC LIMIT $limit;"
		)
		params = {"$limit": limit}
		rows: List[Dict[str, Any]] = []
		assert self._pool is not None
		async with self._pool.acquire() as session:
			result_sets = await session.transaction().execute(query, params, commit_tx=True)
			for row in result_sets[0].rows:
				rows.append({
					"interaction_id": row.interaction_id,
					"channel": row.channel,
					"customer_phone": row.customer_phone,
					"intent": row.intent,
					"result": row.result,
					"sale": row.sale,
					"amount": row.amount,
					"raw": row.raw,
					"created_at": row.created_at,
				})
		return rows

	async def close(self) -> None:
		if self._pool is not None:
			await self._pool.stop()
			self._pool = None
		if self._driver is not None:
			await self._driver.stop()
			self._driver = None
