from pydantic import BaseSettings, Field
from typing import Optional

class Settings(BaseSettings):
	#  SpeechKit
	folder_id: str = Field(default="", alias="YA_FOLDER_ID")
	iam_token: Optional[str] = Field(default=None, alias="YA_IAM_TOKEN")
	oauth_token: Optional[str] = Field(default=None, alias="YA_OAUTH_TOKEN")
	speechkit_api_key: Optional[str] = Field(default=None, alias="YA_SPEECHKIT_API_KEY")

	# YDB
	ydb_endpoint: str = Field(default="", alias="YDB_ENDPOINT")
	ydb_database: str = Field(default="", alias="YDB_DATABASE")
	ydb_sa_key_file: Optional[str] = Field(default=None, alias="YDB_SERVICE_ACCOUNT_KEY_FILE")

	# Recommender
	recommender_top_k: int = Field(default=3, alias="RECOMMENDER_TOP_K")

	class Config:
		env_file = ".env"
		env_file_encoding = "utf-8"
		populate_by_name = True

settings = Settings()
