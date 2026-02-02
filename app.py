import os, redis, firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, render_template, request, jsonify, redirect, url_for
from config import *
# # =====================
# # Firebase Admin
# # =====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, 'serviceAccountKey.json')
cred = credentials.Certificate(cred_path)

# 🔹 Upstash Redis
r = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT,
    password=REDIS_PASSWORD, ssl=REDIS_SSL
)
# =====================
app = Flask(__name__)

# Routes
@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)

@app.route("/verify", methods=["POST"])
def verify():
    data = request.json
    code = data.get("code")

    if not code:
        return jsonify({"ok": False, "msg": "Code missing"}), 400

    # # faqat code
    purpose = "code_check"
    key = f"verify:{code}:{purpose}"
    # Bot DID BELOW
    # r.setex(key, VERIFY_TTL, code)
    if not r.exists(key):
        return jsonify({
            "ok": False,
            "msg": "Invalid or expired code",
            # "codes": codes
            # was just for debugging
        }), 401
    # code to‘gri
    code_value = r.get(key).decode()
    # 🔥 xavfsizlik: barcha kodlarni o‘chiramiz
    r.delete("verify_codes")

    return jsonify({"ok": True})

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


if __name__ == "__main__":
    app.run()
