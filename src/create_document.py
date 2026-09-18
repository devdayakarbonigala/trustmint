import json, uuid, hashlib, hmac, time, base64
import boto3
from ai_hook import run_ai_hook

ddb = boto3.resource("dynamodb")
types_t = ddb.Table("types")
docs_t  = ddb.Table("documents")

_SECRET = None
def _secret():
    global _SECRET
    if _SECRET is None:
        item = types_t.get_item(Key={"type_id": "_secret"}).get("Item", {})
        _SECRET = (item.get("value") or "unset").encode()
    return _SECRET

def _sign(doc_id, created, payload):
    msg = f"{doc_id}|{created}|{json.dumps(payload, sort_keys=True, default=str)}".encode()
    return hmac.new(_secret(), msg, hashlib.sha256).hexdigest()

def _parse(event):
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode()
    return json.loads(raw)

def handler(event, ctx):
    body    = _parse(event)
    type_id = body.get("type_id")
    payload = body.get("payload", {})
    t = types_t.get_item(Key={"type_id": type_id}).get("Item")
    if not t:
        return _resp(400, {"error": f"unknown type {type_id}"})
    for f in t["fields"]:
        if f.get("required") and not payload.get(f["key"]):
            return _resp(400, {"error": f"missing field: {f['key']}"})
    warnings = run_ai_hook(t.get("ai_hook"), payload)
    doc_id  = str(uuid.uuid4())
    created = int(time.time())
    ttl     = created + int(t["expiry_hours"]) * 3600
    qr_hash = hashlib.sha256(f"{doc_id}{created}".encode()).hexdigest()
    sig     = _sign(doc_id, created, payload)
    docs_t.put_item(Item={
        "doc_id": doc_id, "type_id": type_id, "payload": payload,
        "qr_hash": qr_hash, "sig": sig, "status": "active",
        "verification_count": 0, "created_at": created, "ttl": ttl,
    })
    return _resp(200, {"doc_id": doc_id, "qr_hash": qr_hash, "warnings": warnings})

def _resp(code, obj):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
