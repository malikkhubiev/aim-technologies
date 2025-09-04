from fastapi import APIRouter, Request
from typing import Any, Dict
import uuid
from datetime import datetime

from app.services.ydb_client import YdbClient
from app.services.speechkit import SpeechKitService

router = APIRouter()
_ydb = YdbClient()
_speech = SpeechKitService()

@router.post("/webhook")
async def jaicp_webhook(request: Request) -> Dict[str, Any]:
	payload = await request.json()
	# Extract minimal fields; JAICP payloads vary, we keep it resilient
	channel = payload.get("channel", "voice")
	customer_phone = payload.get("userPhone", payload.get("phone", ""))
	intent = payload.get("intent", payload.get("question", ""))
	result = payload.get("result", {}).get("status", "ok")
	sale_flag = bool(payload.get("sale", False))
	amount = float(payload.get("amount", 0)) if payload.get("amount") is not None else 0.0

	record_id = str(uuid.uuid4())
	await _ydb.upsert_interaction(
		interaction_id=record_id,
		channel=channel,
		customer_phone=customer_phone,
		intent=intent,
		result=result,
		sale=sale_flag,
		amount=amount,
		raw=payload,
		created_at=datetime.utcnow(),
	)
	return {"status": "ok", "id": record_id}

@router.post("/stt")
async def stt_endpoint(request: Request) -> Dict[str, Any]:
	# Expect raw bytes sent as body in demo or hex in JSON { audio_hex }
	content_type = request.headers.get("content-type", "")
	if "application/json" in content_type:
		data = await request.json()
		audio_hex = data.get("audio_hex", "")
		try:
			audio_bytes = bytes.fromhex(audio_hex)
		except Exception:
			return {"error": "invalid audio_hex"}
	else:
		audio_bytes = await request.body()
	text = await _speech.stt(audio_bytes)
	return {"text": text}

@router.post("/tts")
async def tts_endpoint(request: Request) -> Dict[str, Any]:
	data = await request.json()
	text = data.get("text", "")
	if not text:
		return {"error": "text is required"}
	audio = await _speech.tts(text)
	# Return hex (safe over JSON); frontend converts to Blob
	return {"audio_hex": audio.hex()}

@router.get("/history")
async def interactions_history(limit: int = 20) -> Dict[str, Any]:
	rows = await _ydb.list_interactions(limit=limit)
	# Make JSON-serializable output
	def to_jsonable(r):
		return {
			"interaction_id": r.get("interaction_id"),
			"channel": r.get("channel"),
			"customer_phone": r.get("customer_phone"),
			"intent": r.get("intent"),
			"result": r.get("result"),
			"sale": bool(r.get("sale", False)),
			"amount": float(r.get("amount", 0)),
			"created_at": str(r.get("created_at")),
		}
	return {"items": [to_jsonable(r) for r in rows]}