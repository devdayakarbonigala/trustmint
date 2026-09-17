import json, glob, boto3
t = boto3.resource("dynamodb", region_name="ap-south-1").Table("types")
for f in glob.glob("seed/*.json"):
    d = json.load(open(f)); t.put_item(Item=d); print("loaded", d["type_id"])
