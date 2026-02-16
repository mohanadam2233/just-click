from __future__ import annotations

import logging
import time
from typing import Optional, Any
import redis

from cmcp.config.settings import settings

log = logging.getLogger(__name__)


class SafeRedis:
    """
    Never raises to app code.
    If Redis is down -> behaves like cache miss / no-op.
    Circuit breaker avoids log spam when Redis is down.
    """

    def __init__(
        self,
        url: str,
        *,
        decode_responses: bool,
        enabled: bool = True,
        connect_timeout: float = 0.25,
        socket_timeout: float = 0.6,
        cooldown_seconds: int = 5,
    ):
        self.url = url
        self.decode_responses = bool(decode_responses)
        self.enabled = bool(enabled)
        self.connect_timeout = float(connect_timeout)
        self.socket_timeout = float(socket_timeout)
        self.cooldown_seconds = int(cooldown_seconds)

        self._client: Optional[redis.Redis] = None
        self._disabled_until: float = 0.0

    def _cooling_down(self) -> bool:
        return time.time() < self._disabled_until

    def _trip(self, err: Exception) -> None:
        self._disabled_until = time.time() + self.cooldown_seconds
        log.warning("Redis unavailable (cooldown %ss): %s", self.cooldown_seconds, err)

    def raw_client(self) -> Optional[redis.Redis]:
        """
        Returns underlying redis-py client OR None. Safe.
        """
        if not self.enabled:
            return None
        if self._cooling_down():
            return None
        if self._client is not None:
            return self._client
        try:
            self._client = redis.Redis.from_url(
                self.url,
                decode_responses=self.decode_responses,
                socket_connect_timeout=self.connect_timeout,
                socket_timeout=self.socket_timeout,
                retry_on_timeout=False,
                health_check_interval=30,
            )
            return self._client
        except Exception as e:
            self._client = None
            self._trip(e)
            return None

    def ping(self) -> bool:
        r = self.raw_client()
        if not r:
            return False
        try:
            return bool(r.ping())
        except Exception as e:
            self._client = None
            self._trip(e)
            return False

    def get(self, key: str) -> Optional[Any]:
        r = self.raw_client()
        if not r:
            return None
        try:
            return r.get(key)
        except Exception as e:
            self._client = None
            self._trip(e)
            return None

    def setex(self, key: str, ttl: int, value: Any) -> bool:
        r = self.raw_client()
        if not r:
            return False
        try:
            r.setex(key, int(ttl), value)
            return True
        except Exception as e:
            self._client = None
            self._trip(e)
            return False

    def incr(self, key: str) -> Optional[int]:
        r = self.raw_client()
        if not r:
            return None
        try:
            return int(r.incr(key))
        except Exception as e:
            self._client = None
            self._trip(e)
            return None

    def delete(self, key: str) -> int:
        r = self.raw_client()
        if not r:
            return 0
        try:
            return int(r.delete(key) or 0)
        except Exception as e:
            self._client = None
            self._trip(e)
            return 0


redis_kv = SafeRedis(settings.REDIS_URL, decode_responses=True, enabled=settings.REDIS_ENABLED)
redis_raw = SafeRedis(settings.REDIS_URL, decode_responses=False, enabled=settings.REDIS_ENABLED)
