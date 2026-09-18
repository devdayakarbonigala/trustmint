import json
import boto3
from boto3.dynamodb.conditions import Key

log_t = boto3.resource("dynamodb").Table("verification_log")

def handler(event, ctx):
    params = event.get("queryStringParameters") or {}
    doc_id = params.get("doc_id")
    if not doc_id:
        return _resp(400, {"error": "doc_id required"})
    items = log_t.query(KeyConditionExpression=Key("doc_id").eq(doc_id),
                        ScanIndexForward=True).get("Items", [])
    history = [{"at": int(i["at"]), "result": i.get("result")} for i in items]
    return _resp(200, {"doc_id": doc_id, "history": history})

def _resp(code, obj):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
