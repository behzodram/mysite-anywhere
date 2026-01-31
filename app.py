from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)


# from flask import Flask, render_template, request, jsonify, redirect, url_for
# import redis
# import firebase_admin
# from firebase_admin import credentials, auth

# # =====================
# # Flask
# # =====================
# app = Flask(__name__)

# # =====================
# # Upstash Redis
# # =====================
# # 🔹 Upstash Redis
# r = redis.Redis(
#     host="evident-panda-61482.upstash.io",
#     port=6379,
#     password="AfAqAAIncDE0YTA3ZjRlY2ZlMTY0YzM3YWE1ODY2MzRjZmRiMmFhM3AxNjE0ODI",
#     ssl=True
# )

# # =====================
# # Firebase Admin
# # =====================
# cred = credentials.Certificate("serviceAccountKey.json")
# firebase_admin.initialize_app(cred)

# # =====================
# # Routes
# # =====================

# @app.route("/")
# def index():
#     return render_template("index.html")


# @app.route("/verify", methods=["POST"])
# def verify():
#     data = request.json
#     user_id = data.get("user_id")
#     code = data.get("code")

#     if not user_id or not code:
#         return jsonify({"ok": False, "msg": "Missing data"}), 400

#     redis_code = r.get(user_id)

#     if redis_code != code:
#         return jsonify({"ok": False, "msg": "Invalid or expired code"}), 401

#     # Firebase user create / get
#     try:
#         user = auth.get_user(user_id)
#     except auth.UserNotFoundError:
#         user = auth.create_user(uid=user_id)

#     # Mark verified
#     auth.set_custom_user_claims(user.uid, {"verified": True})

#     # delete code
#     r.delete(user_id)

#     return jsonify({"ok": True})


# @app.route("/dashboard")
# def dashboard():
#     return render_template("dashboard.html")


# if __name__ == "__main__":
#     app.run()
