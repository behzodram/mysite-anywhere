import time
import firebase_admin
from firebase_admin import credentials, auth, db

class FirebaseUserManager:
    def __init__(self, cred_path, db_url, namespace="users"):
        """
        Firebase Adminni initialize qilish va DB reference olish
        """
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                "databaseURL": db_url
            })
            print("Firebase initialized.")
        self.ref = db.reference(namespace)  # Masalan 'users' namespace

    def create_user(self, email, password, display_name=None):
        """
        Firebase Authentication da yangi user yaratadi
        """
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        print(f'Created user: {user.uid}')
        return user.uid

    def write_user_with_ttl(self, uid, email, display_name=None, ttl_seconds=3600, fbase_redis=None):
        """
        Yaratilgan userni DB ga TTL bilan yozadi
        fbase_redis - FbaseRedis instance
        """
        if fbase_redis is None:
            raise ValueError("FbaseRedis instance required")

        now = int(time.time())
        expire_at = now + ttl_seconds

        # Value object
        value = {
            "email": email,
            "display_name": display_name,
            "created_at": now
        }

        # Redis-like setex
        fbase_redis.setex(uid, ttl_seconds, value)
        print(f'User {uid} added to database with TTL {ttl_seconds} seconds.')

    def Login_Exp(self, email, password, display_name=None, ttl_seconds=3600, fbase_redis=None):
        """
        Yaratish + DB ga TTL bilan yozish bir funksiya orqali
        """
        uid = self.create_user(email, password, display_name)
        self.write_user_with_ttl(uid, email, display_name, ttl_seconds, fbase_redis)
        return uid
