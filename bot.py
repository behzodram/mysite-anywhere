import redis, random
from config import *

r = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    ssl=REDIS_SSL
)

def start() -> str:
    code = str(random.randint(1000, 9999))

    # faqat code
    r.lpush("verify_codes", code)

    # queue 60 soniyada o‘chsin
    r.expire("verify_codes", 60)

    print(f"[BOT] Generated code: {code}")
    return code


# test
if __name__ == "__main__":
    start()
