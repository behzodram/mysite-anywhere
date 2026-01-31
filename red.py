import redis

r = redis.Redis(
    host="evident-panda-61482.upstash.io",
    port=6379,
    password="AfAqAAIncDE0YTA3ZjRlY2ZlMTY0YzM3YWE1ODY2MzRjZmRiMmFhM3AxNjE0ODI",
    ssl=True,
    decode_responses=True  # string qilib beradi
)

def consume():
    print("[CONSUMER] Waiting for verification codes...")

    while True:
        # BRPOP: listdan element chiqmaguncha kutadi
        result = r.brpop("verify_codes", timeout=0)

        if result:
            queue_name, code = result
            print(f"[CONSUMER] Received code: {code}")

if __name__ == "__main__":
    consume()
