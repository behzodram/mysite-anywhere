import redis
import random

r = redis.Redis(
    host="evident-panda-61482.upstash.io",
    port=6379,
    password="***",
    ssl=True,
    decode_responses=True
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