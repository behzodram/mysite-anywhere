import random, json, time
from RedisFB import FbaseRedis
from config import *

r = FbaseRedis(CRED_FB_Redis_PATH, DB_FB_Redis_URL, "VERIFY")

def start_command(iterate):
    # Generate 4-digit code
    for x in range(1000, iterate):        
        code = int(random.randint(1000, 9999))
        print(f"Generated code: {code} for iteration: {x}")
        
        # Create hash key
        key = h_key(code)
        
        # Prepare data
        data = {
            "iterate": x
        }
        
        # Store in Redis
        r.setex(key, 10*60, json.dumps(data))
        # r.delete(key)
        print(f"Deleted from Redis with key: {key}")

def clean_expired():
    for _ in range(20):  # Run cleaner 10 times
        print(f"Running cleaner...{_ // 2}")
        r.clean_expired()
        time.sleep(30)  # To avoid hitting rate limits

def main():
    # start_command(2000)
    clean_expired()

if __name__ == "__main__":
    main()