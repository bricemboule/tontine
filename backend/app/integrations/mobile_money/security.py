import hashlib
import hmac


def verifier_hmac(secret: str, body: bytes, signature: str) -> bool:
    attendu = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(attendu, signature or "")
