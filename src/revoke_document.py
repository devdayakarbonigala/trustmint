import json, base64
import boto3

docs_t = boto3.resource("dynamodb").Table("documents")

def _parse(event):
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode()
    return json.loads(raw)

def handler(event, ctx):
    doc_id = _parse(event).get("doc_id")
    if not doc_id:
        return _resp(400, {"error": "doc_id required"})
    docs_t.update_item(
        Key={"doc_id": doc_id},
        UpdateExpression="SET #s = :st",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":st": "revoked"})
    return _resp(200, {"doc_id": doc_id, "status": "revoked"})

def _resp(code, obj):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
