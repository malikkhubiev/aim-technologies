from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.jaicp import router as jaicp_router
from app.routers.recommend import router as recommend_router

app = FastAPI(title="Retail AiM MVP", default_response_class=ORJSONResponse)

# CORS for demo/frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict:
	return {"status": "ok"}

app.include_router(jaicp_router, prefix="/jaicp", tags=["jaicp"])
app.include_router(recommend_router, prefix="/recommend", tags=["recommend"])

# Static demo frontend
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
