import redis, random
from config import *

r = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT,
    password=REDIS_PASSWORD, ssl=REDIS_SSL
)

def start() -> str:
    code = str(random.randint(1000, 9999))

    # faqat code
    purpose = "code_check"
    key = f"verify:{code}:{purpose}"
    r.setex(key, VERIFY_TTL, code)

    print(f"[BOT] Generated code: {code}")
    return code


# test
if __name__ == "__main__":
    start()
