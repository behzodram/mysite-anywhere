import os
import redis
import json
import uuid
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from config import *

# Initialize Redis
r = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT,
    password=REDIS_PASSWORD, ssl=REDIS_SSL
)

app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY

@app.before_request
def check_verification():
    """Check if user is already verified before every request"""
    # Skip for API endpoints and static files
    if request.path.startswith('/static') or request.path.startswith('/api'):
        return None
    
    # Skip for verify and logout endpoints
    if request.path in ['/verify', '/logout']:
        return None
    
    session_id = session.get('session_id')
    
    # If no session, create new one
    if not session_id:
        return None
    
    # Check if session exists in Redis
    session_data = r.get(f"session:{session_id}")
    if not session_data:
        return None
    
    session_data = json.loads(session_data.decode())
    
    # If verified, redirect to dashboard (except for dashboard itself)
    if session_data.get("verified") and request.path != '/dashboard':
        return redirect('/dashboard')
    
    return None

@app.route("/")
def index():
    """Main page - show only if not verified"""
    session_id = session.get('session_id')
    
    # Create session if not exists
    if not session_id:
        session_id = str(uuid.uuid4().hex[:12])
        session['session_id'] = session_id
        
        # Store in Redis
        r.setex(f"session:{session_id}", SESSION_TTL, json.dumps({
            "verified": False
        }))
    
    # Check if already verified
    session_data = r.get(f"session:{session_id}")
    if session_data:
        session_data = json.loads(session_data.decode())
        if session_data.get("verified"):
            return redirect('/dashboard')
    
    # Create bot deep link
    bot_link = f"https://t.me/verify_claude_bot?start={session_id}"
    
    return render_template("index.html", 
                         session_id=session_id,
                         bot_link=bot_link)

@app.route("/verify", methods=["POST"])
def verify():
    """Verify the code"""
    data = request.json
    code = data.get("code")
    session_id = data.get("session_id")
    
    if not code or not session_id:
        return jsonify({"ok": False, "msg": "Missing code or session"}), 400
    
    # Create hash key
    key = h_key(code)
    
    # Check if code exists in Redis
    if not r.exists(key):
        return jsonify({
            "ok": False,
            "msg": "Invalid or expired code"
        }), 401
    
    # Get code data
    code_data = json.loads(r.get(key).decode())
    
    # Verify session_id matches
    if code_data.get("session_id") != session_id:
        return jsonify({
            "ok": False,
            "msg": "Session mismatch"
        }), 401
    
    # Mark session as verified
    r.setex(f"session:{session_id}", SESSION_TTL, json.dumps({
        "verified": True,
        "telegram_id": code_data.get("telegram_id"),
        "username": code_data.get("username")
    }))
    
    # Delete used code
    r.delete(key)
    
    return jsonify({"ok": True, "msg": "Verification successful"})

@app.route("/dashboard")
def dashboard():
    """Dashboard after verification"""
    session_id = session.get('session_id')
    
    if not session_id:
        return redirect("/")
    
    # Check if session is verified
    session_data = r.get(f"session:{session_id}")
    if not session_data:
        return redirect("/")
    
    session_data = json.loads(session_data.decode())
    
    if not session_data.get("verified"):
        return redirect("/")
    
    return render_template("dashboard.html", 
                         user_id=session_data.get("telegram_id"),
                         username=session_data.get("username", "User"))

@app.route("/logout")
def logout():
    """Logout user"""
    session_id = session.get('session_id')
    if session_id:
        r.delete(f"session:{session_id}")
    session.clear()
    return redirect("/")

@app.route("/api/session-check")
def session_check():
    """Check if session is valid"""
    session_id = session.get('session_id')
    
    if not session_id:
        return jsonify({"valid": False}), 401
    
    session_data = r.get(f"session:{session_id}")
    if not session_data:
        return jsonify({"valid": False}), 401
    
    session_data = json.loads(session_data.decode())
    return jsonify({"valid": session_data.get("verified", False)})

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG)