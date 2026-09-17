import json, time
import boto3

ddb = boto3.resource("dynamodb")
docs_t  = ddb.Table("documents")
types_t = ddb.Table("types")

def handler(event, ctx):
    body    = json.loads(event.get("body") or "{}")
    qr_hash = body.get("qr_hash")

    items = docs_t.scan(
        FilterExpression="qr_hash = :h",
        ExpressionAttributeValues={":h": qr_hash}).get("Items", [])
    if not items:
        return _resp(200, {"result": "invalid"})

    doc = items[0]
    t = types_t.get_item(Key={"type_id": doc["type_id"]}).get("Item", {})
    now = int(time.time())

    if doc.get("status") == "revoked":
        return _resp(200, {"result": "revoked"})
    if now > int(doc["ttl"]):
        return _resp(200, {"result": "expired"})
    if t.get("one_time") and int(doc["verification_count"]) >= 1:
        return _resp(200, {"result": "already_used"})

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
            "headers": {"Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
