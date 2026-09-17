import json, boto3
t = json.load(open("seed/prescription.json"))
boto3.resource("dynamodb", region_name="ap-south-1").Table("types").put_item(Item=t)
print("loaded type:", t["type_id"])
