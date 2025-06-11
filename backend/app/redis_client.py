import redis.asyncio as redis

_redis_client = None


async def init_redis():
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)


async def close_redis():
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None


def get_redis_client():
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized")
    return _redis_client
