import redis, random

# =====================
# Upstash Redis
# =====================
# 🔹 Upstash Redis
r = redis.Redis(
    host="evident-panda-61482.upstash.io",
    port=6379,
    password="AfAqAAIncDE0YTA3ZjRlY2ZlMTY0YzM3YWE1ODY2MzRjZmRiMmFhM3AxNjE0ODI",
    ssl=True
)

def start(user_id):
    code = str(random.randint(1000, 9999))
    r.setex(user_id, 300, code)
    return code
