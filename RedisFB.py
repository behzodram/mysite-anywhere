import firebase_admin
from firebase_admin import credentials, db
import time

class FbaseRedis:
    def __init__(self, cred_path, db_url, namespace):
        # Firebase Adminni initialize qilish
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                "databaseURL": db_url
            })
        self.ref = db.reference(namespace)

    def setex(self, key, ttl_seconds, value):
        """Redis setex funksiyasini taqlid qiladi"""
        expire_at = int(time.time()) + ttl_seconds
        self.ref.child(key).set({
            "value": value,
            "expire_at": expire_at
        })

    def get(self, key):
        """Redis get funksiyasini taqlid qiladi, TTLni tekshiradi"""
        data = self.ref.child(key).get()
        if not data:
            return None
        if int(time.time()) > data.get("expire_at", 0):
            # Expired bo‘lsa o‘chirish
            self.ref.child(key).delete()
            return None
        return data.get("value")

    def delete(self, key):
        """Kalitni o‘chiradi"""
        self.ref.child(key).delete()

    def exists(self, key):
        """Kalit mavjudligini tekshiradi"""
        data = self.ref.child(key).get()
        if not data:
            return False
        if int(time.time()) > data.get("expire_at", 0):
            # Expired bo‘lsa o‘chirish
            self.ref.child(key).delete()
            return False
        return True