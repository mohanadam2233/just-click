# from pydantic import Field, field_validator
# from pydantic_settings import BaseSettings, SettingsConfigDict
# from typing import List, Optional, Literal
# from dotenv import load_dotenv
# import json
# from cryptography.fernet import Fernet
# from pathlib import Path
# # ✅ make sure it always finds backend/.env even if run from another cwd
# ENV_PATH = Path(__file__).resolve().parents[2] / ".env"  # adjust if your structure differs
#
# load_dotenv()
#
# SameSite = Literal["lax", "strict", "none"]
#
# # ✅ make sure it always finds backend/.env even if run from another cwd
# ENV_PATH = Path(__file__).resolve().parents[2] / ".env"  # adjust if your structure differs
#
# class Settings(BaseSettings):
#     model_config = SettingsConfigDict(env_file=".env", extra="ignore")
#
#     ENV: str = "development"
#     LOG_LEVEL: str = "INFO"
#
#     SECRET_KEY: str = Field(..., min_length=16)
#     SECURITY_PASSWORD_SALT: str = Field(..., min_length=8)
#
#     # 44 chars base64 key for Fernet
#     ENCRYPTION_KEY: str = Field(..., min_length=44)
#
#     DATABASE_HOST: str
#     DATABASE_PORT: int
#     DATABASE_USER: str
#     DATABASE_PASSWORD: str
#     DATABASE_NAME: str
#     # ✅ ADD THIS
#     DEFAULT_COMPANY_ID: Optional[int] = None
#
#     @property
#     def SQLALCHEMY_DATABASE_URI(self) -> str:
#         return (
#             f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
#             f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
#         )
#
#     REDIS_HOST: str
#     REDIS_PORT: int
#     REDIS_DB: int = 0
#
#     @property
#     def REDIS_URL(self) -> str:
#         return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
#
#     CORS_ALLOWED_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:5173"])
#     CORS_ALLOW_ORIGIN_REGEX: Optional[str] = None
#
#     @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
#     @classmethod
#     def _parse_origins(cls, v):
#         if isinstance(v, list):
#             return v
#         if isinstance(v, str):
#             s = v.strip()
#             if s.startswith("["):
#                 try:
#                     arr = json.loads(s)
#                     if isinstance(arr, list):
#                         return [str(x).strip() for x in arr if str(x).strip()]
#                 except Exception:
#                     pass
#             return [p.strip() for p in s.split(",") if p.strip()]
#         return ["http://localhost:5173"]
#
#     SESSION_COOKIE_NAME: str = "session_id"
#     SESSION_COOKIE_HTTPONLY: bool = True
#     SESSION_COOKIE_MAX_AGE: int = 60 * 60 * 24
#     SESSION_COOKIE_SECURE: bool = False
#     SESSION_COOKIE_SAMESITE: SameSite = "lax"
#     SESSION_COOKIE_DOMAIN: Optional[str] = None
#
#     CROSS_SITE_COOKIES: bool = False
#
#     @field_validator("SESSION_COOKIE_SAMESITE", mode="before")
#     @classmethod
#     def _normalize_samesite(cls, v):
#         if not isinstance(v, str):
#             return "lax"
#         s = v.strip().lower()
#         return s if s in {"lax", "strict", "none"} else "lax"
#
#     @property
#     def cookie_samesite_effective(self) -> SameSite:
#         return "none" if self.CROSS_SITE_COOKIES else self.SESSION_COOKIE_SAMESITE
#
#     @property
#     def cookie_secure_effective(self) -> bool:
#         return True if self.CROSS_SITE_COOKIES else self.SESSION_COOKIE_SECURE
#
#
# settings = Settings()
#
# try:
#     FERNET_INSTANCE = Fernet(settings.ENCRYPTION_KEY.encode())
# except Exception as e:
#     raise ValueError("Invalid ENCRYPTION_KEY") from e
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional, Literal
import json

from dotenv import load_dotenv
from cryptography.fernet import Fernet
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SameSite = Literal["lax", "strict", "none"]
SessionBackend = Literal["cookie", "filesystem", "redis"]


def _backend_root() -> Path:
    # backend/src/cmcp/config/settings.py -> backend/
    return Path(__file__).resolve().parents[3]

ENV_PATH = Path(os.getenv("CMCP_ENV_FILE", _backend_root() / ".env")).resolve()

# 🔥 Hard fail early if missing (so you don't get mysterious "Field required")
if not ENV_PATH.exists():
    raise FileNotFoundError(
        f"Could not find .env file at: {ENV_PATH}\n"
        f"Create backend/.env (copy from .env.example) or set CMCP_ENV_FILE."
    )

load_dotenv(dotenv_path=ENV_PATH, override=False)

class Settings(BaseSettings):
    # ✅ pydantic will also read this exact file
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        extra="ignore",
    )

    ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    SECRET_KEY: str = Field(..., min_length=16)
    SECURITY_PASSWORD_SALT: str = Field(..., min_length=8)
    ENCRYPTION_KEY: str = Field(..., min_length=44)  # Fernet key

    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_NAME: str

    DEFAULT_COMPANY_ID: Optional[int] = None

    # -------------------------
    # Redis (optional)
    # -------------------------
    REDIS_ENABLED: bool = True
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # -------------------------
    # Sessions (FAIL-SAFE DEFAULT)
    # -------------------------
    SESSION_BACKEND: SessionBackend = "cookie"
    SESSION_FILESYSTEM_DIR: str = ".flask_session"

    SESSION_COOKIE_NAME: str = "session_id"
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_MAX_AGE: int = 60 * 60 * 24
    SESSION_COOKIE_SECURE: bool = False
    SESSION_COOKIE_SAMESITE: SameSite = "lax"
    SESSION_COOKIE_DOMAIN: Optional[str] = None
    CROSS_SITE_COOKIES: bool = False

    @field_validator("SESSION_COOKIE_SAMESITE", mode="before")
    @classmethod
    def _normalize_samesite(cls, v):
        if not isinstance(v, str):
            return "lax"
        s = v.strip().lower()
        return s if s in {"lax", "strict", "none"} else "lax"

    @property
    def cookie_samesite_effective(self) -> SameSite:
        return "none" if self.CROSS_SITE_COOKIES else self.SESSION_COOKIE_SAMESITE

    @property
    def cookie_secure_effective(self) -> bool:
        return True if self.CROSS_SITE_COOKIES else self.SESSION_COOKIE_SECURE

    # -------------------------
    # CORS
    # -------------------------
    CORS_ALLOWED_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    CORS_ALLOW_ORIGIN_REGEX: Optional[str] = None

    @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _parse_origins(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            s = v.strip()
            if s.startswith("["):
                try:
                    arr = json.loads(s)
                    if isinstance(arr, list):
                        return [str(x).strip() for x in arr if str(x).strip()]
                except Exception:
                    pass
            return [p.strip() for p in s.split(",") if p.strip()]
        return ["http://localhost:3000"]

    # -------------------------
    # Chatbot / RAG
    # -------------------------
    DEEPSEEK_API_KEY: str = ""
    CHATBOT_LLM_BASE_URL: str = "https://api.deepseek.com"
    CHATBOT_LLM_MODEL: str = "deepseek-chat"
    CHATBOT_CHROMA_DIR: str = "instance/chroma_db"
    CHATBOT_COLLECTION_NAME: str = "semester_subject_materials"
    CHATBOT_TOP_K: int = 4
    CHATBOT_RELEVANCE_THRESHOLD: float = 1.3
    CHATBOT_MAX_CONTEXT_CHUNKS: int = 15


settings = Settings()

try:
    FERNET_INSTANCE = Fernet(settings.ENCRYPTION_KEY.encode())
except Exception as e:
    raise ValueError("Invalid ENCRYPTION_KEY") from e
