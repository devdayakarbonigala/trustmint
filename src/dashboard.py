import json, time
import boto3

docs_t = boto3.resource("dynamodb").Table("documents")

def handler(event, ctx):
    now = int(time.time())
    counts = {"total": 0, "active": 0, "used": 0, "verified": 0,
              "revoked": 0, "expired": 0, "fraud_attempts": 0}
    kwargs = {"ProjectionExpression": "#s, #t, blocked_attempts",
              "ExpressionAttributeNames": {"#s": "status", "#t": "ttl"}}
    items, scan = [], docs_t.scan(**kwargs)
    items += scan.get("Items", [])
    while "LastEvaluatedKey" in scan:
        scan = docs_t.scan(ExclusiveStartKey=scan["LastEvaluatedKey"], **kwargs)
        items += scan.get("Items", [])
    for it in items:
        counts["total"] += 1
        counts["fraud_attempts"] += int(it.get("blocked_attempts", 0))
        st = it.get("status", "active")
        if int(it.get("ttl", 0)) < now and st != "revoked":
            counts["expired"] += 1
        elif st in counts:
            counts[st] += 1
        else:
            counts["active"] += 1
    return _resp(200, counts)

def _resp(code, obj):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
