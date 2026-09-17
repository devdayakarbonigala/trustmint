import json, uuid, hashlib, time
import boto3

ddb = boto3.resource("dynamodb")
types_t = ddb.Table("types")
docs_t  = ddb.Table("documents")

def handler(event, ctx):
    body    = json.loads(event.get("body") or "{}")
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

    docs_t.put_item(Item={
        "doc_id": doc_id, "type_id": type_id, "payload": payload,
        "qr_hash": qr_hash, "status": "active", "verification_count": 0,
        "created_at": created, "ttl": ttl,
    })
    return _resp(200, {"doc_id": doc_id, "qr_hash": qr_hash, "warnings": warnings})

def run_ai_hook(hook, payload):
    # Praveen wires Bedrock here (drug-interaction check). No-op for now.
    return []

def _resp(code, obj):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
