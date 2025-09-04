from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from app.services.recommender import RecommenderService
from app.config import settings

router = APIRouter()

class RecommendRequest(BaseModel):
	query: str
	top_k: int | None = None

class Product(BaseModel):
	id: str
	name: str
	price: float
	category: str
	discount: float
	margin_rate: float
	keywords: list[str]
	score: float

_recommender = RecommenderService(top_k=settings.recommender_top_k)

	@router.post("/query", response_model=List[Product])
	async def recommend(req: RecommendRequest):
		top_k = req.top_k or settings.recommender_top_k
		products = _recommender.recommend(req.query, top_k=top_k)
		if not products:
			raise HTTPException(status_code=404, detail="No recommendations found")
		return products
