import firebase_admin
from firebase_admin import credentials, auth, db
from Manager import FirebaseUserManager
from RedisFB import FbaseRedis
from config import *

# ------------------- Misol ishlatish -------------------
if __name__ == "__main__":

    path = CRED_FB_Redis_PATH
    db_url = DB_FB_Redis_URL
    Menager_zero = FirebaseUserManager(path, db_url, "users")

    # FirebaseUserManager
    manager = FirebaseUserManager(path, db_url, namespace="users")
    fbase_redis = FbaseRedis(path, db_url, "users")

    email = "+998906362704@gmail.com"
    password = "test12345678"
    display_name = "Behzod Exp"
    ttl_seconds = 300  # 1 soat

    uid = manager.Login_Exp(email, password, display_name, ttl_seconds, fbase_redis)
    print(f'User registered with UID: {uid} and TTL {ttl_seconds} seconds')
