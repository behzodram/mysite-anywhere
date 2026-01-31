import os
import json
import redis
from flask import request

# 🔹 Upstash Redis
r = redis.Redis(
    host="evident-panda-61482.upstash.io",
    port=6379,
    password="AfAqAAIncDE0YTA3ZjRlY2ZlMTY0YzM3YWE1ODY2MzRjZmRiMmFhM3AxNjE0ODI",
    ssl=True
)

def verify():
    data = request.json
    code = data.get("code")

    if not code:
        return jsonify({"ok": False, "msg": "Code missing"}), 400

    codes = r.lrange("verify_codes", 0, -1)

    if code not in codes:
        return jsonify({"ok": False, "msg": "Invalid or expired code"}), 401

    # 🔥 xavfsizlik: barcha kodlarni o‘chiramiz
    r.delete("verify_codes")

    return jsonify({"ok": True})

# test
if __name__ == "__main__":
    print( verify() )