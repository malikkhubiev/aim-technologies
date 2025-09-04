import base64
from typing import Optional
import httpx
from app.config import settings

class SpeechKitService:
	def __init__(self) -> None:
		self.folder_id = settings.folder_id
		self.iam_token = settings.iam_token or settings.oauth_token
		self.api_key = settings.speechkit_api_key
		self._client = httpx.AsyncClient(timeout=30)

	async def tts(self, text: str, voice: str = "alyss") -> bytes:
		url = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize"
		headers = {}
		if self.api_key:
			headers["Authorization"] = f"Api-Key {self.api_key}"
		elif self.iam_token:
			headers["Authorization"] = f"Bearer {self.iam_token}"
		data = {
			"text": text,
			"lang": "ru-RU",
			"voice": voice,
			"folderId": self.folder_id,
		}
		try:
			resp = await self._client.post(url, data=data, headers=headers)
			resp.raise_for_status()
			return resp.content
		except Exception:
			# Minimal WAV with silence as offline/mock fallback
			return (
				b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"  # PCM mono
				b"@\x1f\x00\x00@\x1f\x00\x00\x01\x00\x08\x00data\x00\x00\x00\x00"
			)

	async def stt(self, audio_bytes: bytes, sample_rate: int = 8000, lang: str = "ru-RU") -> str:
		url = "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize"
		headers = {}
		if self.api_key:
			headers["Authorization"] = f"Api-Key {self.api_key}"
		elif self.iam_token:
			headers["Authorization"] = f"Bearer {self.iam_token}"
		params = {"lang": lang, "folderId": self.folder_id}
		try:
			resp = await self._client.post(url, params=params, headers=headers, content=audio_bytes)
			resp.raise_for_status()
			data = resp.json()
			return data.get("result", "")
		except Exception:
			return ""
