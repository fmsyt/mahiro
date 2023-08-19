import time
from tinydb import TinyDB, Query

db = TinyDB("db.json")

def register(token: str, expiration: int | None = None):
    expire_at = None
    if expiration is not None:
        expire_at = time.time() + expiration

    db.insert({"token": token, "expire_at": expire_at, "is_expired": False })

def verify(token):

    if token is None:
        return False

    rows = db.search(Query().token == token)
    if len(rows) == 0:
        return False

    elif len(rows) > 1:
        db.remove(Query().token == token)
        return False

    row = rows[0]
    if row["is_expired"]:
        db.remove(Query().token == token)
        return False

    if row["expire_at"] is not None and row["expire_at"] < time.time():
        db.remove(Query().token == token)
        return False

    return True

def expire(token: str):
    db.remove(Query().token == token)

def expire_all():
    db.purge()

def cleanup():
    db.purge()
    # rows = db.search(Query().expire_at < time.time())
    # for row in rows:
    #     db.remove(Query().token == row["token"])

    pass

if __name__ == "__main__":
    cleanup()
