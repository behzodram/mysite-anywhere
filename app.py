import os
import redis
import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, render_template, request, jsonify, redirect, url_for

# from flask import Flask, render_template

# =====================
# Flask
# =====================
app = Flask(__name__)
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

# =====================
# Routes
# =====================
@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)

# # =====================
# # Firebase Admin
# # =====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, 'serviceAccountKey.json')
cred = credentials.Certificate(cred_path)

@app.route("/verify", methods=["POST"])
def verify():
    data = request.json
    code = data.get("code")

    if not code:
        return jsonify({"ok": False, "msg": "Code missing"}), 400

    codes_raw = r.lrange("verify_codes", 0, -1)
    codes = [c.decode("utf-8") for c in codes_raw]

    if code not in codes:
        return jsonify({
            "ok": False,
            "msg": "Invalid or expired code",
            # "codes": codes
            # was just for debugging
        }), 401

    # 🔥 xavfsizlik: barcha kodlarni o‘chiramiz
    r.delete("verify_codes")

    return jsonify({"ok": True})



@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


if __name__ == "__main__":
    app.run()
