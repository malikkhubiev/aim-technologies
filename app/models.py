from pydantic import BaseModel
from typing import Any, Dict
from datetime import datetime

class Interaction(BaseModel):
	interaction_id: str
	channel: str
	customer_phone: str
	intent: str
	result: str
	sale: bool
	amount: float
	raw: Dict[str, Any]
	created_at: datetime
