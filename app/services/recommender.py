import json
import os
from typing import List, Dict, Any
from pathlib import Path

class RecommenderService:
	def __init__(self, top_k: int = 3, data_path: str | None = None) -> None:
		self.top_k = top_k
		self.data_path = data_path or str(Path(__file__).resolve().parent.parent / "data" / "products.json")
		self._products = self._load()

	def _load(self) -> List[Dict[str, Any]]:
		if not os.path.exists(self.data_path):
			return []
		with open(self.data_path, "r", encoding="utf-8") as f:
			return json.load(f)

	def _tokenize(self, text: str) -> List[str]:
		return [t.lower() for t in text.replace(',', ' ').replace('.', ' ').split() if t]

	def _score(self, query: str, item: Dict[str, Any]) -> float:
		q_tokens = set(self._tokenize(query))
		keywords = set([k.lower() for k in item.get("keywords", [])])
		match_score = len(q_tokens & keywords)
		discount = float(item.get("discount", 0.0))
		margin = float(item.get("margin_rate", 0.0))
		# Weighted scoring: prioritize margin, then intent match, then discount
		return margin * 2.0 + match_score * 1.5 + discount * 0.5

	def recommend(self, query: str, top_k: int | None = None) -> List[Dict[str, Any]]:
		k = top_k or self.top_k
		scored = []
		for p in self._products:
			scored.append({**p, "score": round(self._score(query, p), 4)})
		scored.sort(key=lambda x: x["score"], reverse=True)
		return scored[:k]
