import secrets, boto3
boto3.resource("dynamodb", region_name="ap-south-1").Table("types").put_item(
    Item={"type_id": "_secret", "value": secrets.token_hex(32)})
print("signing secret provisioned (stored in DynamoDB, never in git)")
