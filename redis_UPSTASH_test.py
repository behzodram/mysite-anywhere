import redis
# VPS Redis ma'lumotlari
r = redis.Redis(
    host="evident-panda-61482.upstash.io",
    port=6379,
    password="AfAqAAIncDE0YTA3ZjRlY2ZlMTY0YzM3YWE1ODY2MzRjZmRiMmFhM3AxNjE0ODI",
    ssl=True
)
try:
    if r.ping():
        print("✅ PythonAnywhere dan Redis serverga bog'landi!")
    else:
        print("❌ Ping muvaffaqiyatsiz")
except Exception as e:
    print("❌ Xatolik:", e)