import json
import glob
import boto3

table = boto3.resource(
    "dynamodb",
    region_name="ap-south-1"
).Table("types")

for file in glob.glob("seed/*.json"):
    with open(file, "r") as f:
        document_type = json.load(f)

    table.put_item(Item=document_type)

    print("loaded type:", document_type["type_id"])