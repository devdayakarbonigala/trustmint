import json, time, base64
import boto3

ddb = boto3.resource("dynamodb")
docs_t  = ddb.Table("documents")
types_t = ddb.Table("types")

def _parse(event):
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode()
    return json.loads(raw)

def _bump_blocked(doc_id):
    try:
        docs_t.update_item(
            Key={"doc_id": doc_id},
            UpdateExpression="ADD blocked_attempts :one",
            ExpressionAttributeValues={":one": 1})
    except Exception:
        pass

def handler(event, ctx):
    qr_hash = _parse(event).get("qr_hash")

    items = docs_t.scan(
        FilterExpression="qr_hash = :h",
        ExpressionAttributeValues={":h": qr_hash}).get("Items", [])
    if not items:
        return _resp(200, {"result": "invalid"})

    doc = items[0]
    t = types_t.get_item(Key={"type_id": doc["type_id"]}).get("Item", {})
    now = int(time.time())

    if doc.get("status") == "revoked":
        _bump_blocked(doc["doc_id"]); return _resp(200, {"result": "revoked"})
    if now > int(doc["ttl"]):
        _bump_blocked(doc["doc_id"]); return _resp(200, {"result": "expired"})
    if t.get("one_time") and int(doc["verification_count"]) >= 1:
        _bump_blocked(doc["doc_id"]); return _resp(200, {"result": "already_used"})

    count  = int(doc["verification_count"]) + 1
    status = "used" if t.get("one_time") else "verified"
    docs_t.update_item(
        Key={"doc_id": doc["doc_id"]},
        UpdateExpression="SET verification_count = :c, #s = :st",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":c": count, ":st": status})

    return _resp(200, {"result": "valid", "payload": doc["payload"],
                       "type": doc["type_id"], "verification": count})

def _resp(code, obj):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
