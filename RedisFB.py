import firebase_admin
from firebase_admin import credentials, db
import time, json

class FbaseRedis:
    def __init__(self, cred_path, db_url, namespace="VERIFY"):
        # Firebase Adminni initialize qilish
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                "databaseURL": db_url
            })
        self.ref = db.reference(namespace)
        self.ref_by_time = db.reference(f"{namespace}_BY_TIME")  # TTL shard

    def setex(self, key, ttl_seconds, value):
        """Hybrid TTL setex — atomic multi-path"""

        expire_at = int(time.time()) + ttl_seconds
        expire_minute = expire_at // 60

        updates = {
            f"{key}": {
                "value": value,
                "expire_at": expire_at
            },
            f"{expire_minute}/{key}": True
        }

        # Root refs
        root_updates = {
            f"{self.ref.path}/{key}": updates[key],
            f"{self.ref_by_time.path}/{expire_minute}/{key}": True
        }

        db.reference("/").update(root_updates)

    def get(self, key):
        data = self.ref.child(key).get()
        if not data:
            return None
        if int(time.time()) > data.get("expire_at", 0):
            self._delete_hybrid(key, data.get("expire_at"))
            return None
        return data.get("value")

    def delete(self, key):
        data = self.ref.child(key).get()
        if not data:
            return
        self._delete_hybrid(key, data.get("expire_at"))

    def _delete_hybrid(self, key, expire_at):
        """Hybrid TTL delete — VERIFY + VERIFY_BY_TIME"""
        self.ref.child(key).delete()
        if expire_at is not None:
            expire_minute = expire_at // 60
            self.ref_by_time.child(str(expire_minute)).child(key).delete()

    def exists(self, key):
        data = self.ref.child(key).get()
        if not data:
            return False
        if int(time.time()) > data.get("expire_at", 0):
            self._delete_hybrid(key, data.get("expire_at"))
            return False
        return True

    def ttl(self, key):
        data = self.ref.child(key).get()
        if not data:
            return -2
        expire_at = data.get("expire_at")
        if not expire_at:
            return -1
        remaining = expire_at - int(time.time())
        return max(remaining, 0)

    def clean_expired(self):
        now_minute = int(time.time()) // 60
        total_deleted = 0

        # O'tgan minutlarni scan qilamiz
        expired_nodes = self.ref_by_time.order_by_key().end_at(str(now_minute)).get()
        if not expired_nodes:
            print("No expired keys found.")

            # Har safar cleaner tugagach,
            # shardni rebuild qilamiz
            # self.rebuild_shard()  
            
            return total_deleted

        for minute_key, keys in expired_nodes.items():
            for key in keys:
                # VERIFY va shard ikkalasini o'chiramiz
                data = self.ref.child(key).get()
                expire_at = data.get("expire_at") if data else None
                ###################################################
                # Pretty print
                # print("Data:")
                # print(json.dumps(data, indent=4))   # 4 space indent bilan chiroyli ko'rinish
                # print("Expire at:", expire_at)
                ###################################################
                self._delete_hybrid(key, expire_at)
                total_deleted += 1
                print(f"Deleted expired: {key}")
            # Minute node tozalash
            self.ref_by_time.child(minute_key).delete()

        print(f"Cleaner done. Total deleted: {total_deleted}")
        return total_deleted