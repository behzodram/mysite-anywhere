import time
from RedisFB import FbaseRedis
from config import *

verifyR = FbaseRedis(CRED_FB_Redis_PATH, DB_FB_Redis_URL, "VERIFY")
usersR = FbaseRedis(CRED_FB_Redis_PATH, DB_FB_Redis_URL, "users")

last_daily_run = 0  # oxirgi kunlik tozalash vaqti (timestamp)
TTL_USERS = 30  # USERS Redis uchun TTL (24 soat)

def clean_expired_loop():
    global last_daily_run  # oxirgi kunlik tozalash vaqti (timestamp)
    
    while True:
        now = time.time()
        
        # VERIFY Redis har soniyada tozalanadi
        print("Running VERIFY cleaner...")
        verifyR.clean_expired()
        
        # USERS Redis har kuni 1 marta tozalanadi
        # Agar oxirgi tozalash 24 soat oldin bo‘lgan bo‘lsa
        if now - last_daily_run >= TTL_USERS:
            print("Running USERS daily cleaner...")
            usersR.clean_expired()
            last_daily_run = now
        
        time.sleep(30)  # har 30 soniyada tekshirish

def main():
    clean_expired_loop()

if __name__ == "__main__":
    main()
