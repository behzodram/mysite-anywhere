import redis
import random
import time

# =====================
# Upstash Redis
# =====================
r = redis.Redis(
    host="evident-panda-61482.upstash.io",
    port=6379,
    password="AfAqAAIncDE0YTA3ZjRlY2ZlMTY0YzM3YWE1ODY2MzRjZmRiMmFhM3AxNjE0ODI",
    ssl=True,
    decode_responses=True  # shunda get() string qaytaradi
)

def start(user_id: str) -> str:
    # 4-xonali kod
    code = str(random.randint(1000, 9999)).zfill(4)

    # terminalga chiqarsin
    print(f"[BOT] Generated code for user {user_id}: {code}")

    # Redis’ga 60 soniya expire bilan yuborish
    r.setex(user_id, 60, code)

    return code


# ======= Test uchun =======
if __name__ == "__main__":
    test_user_id = "123456789"
    code = start(test_user_id)
    print(f"[TEST] Code sent to Redis: {code}")

    # Redis’dan test
    stored = r.get(test_user_id)
    print(f"[TEST] Stored in Redis: {stored}")

    time.sleep(61)  # expire tekshirish
    expired = r.get(test_user_id)
    print(f"[TEST] After 61s, Redis get: {expired}")