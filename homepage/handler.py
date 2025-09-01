import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

HOMEPAGE_ID = "homepage"

# ---- GET latest config ----
def get_config(event, context):
    try:
        response = table.query(
            KeyConditionExpression=Key("id").eq(HOMEPAGE_ID),
            ScanIndexForward=False,  # newest first
            Limit=1
        )
        items = response.get("Items", [])
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(items[0] if items else {})
        }
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}


# ---- GET all versions ----
def get_versions(event, context):
    try:
        response = table.query(
            KeyConditionExpression=Key("id").eq(HOMEPAGE_ID),
            ScanIndexForward=False
        )
        return {
            "statusCode": 200,
            "body": json.dumps(response.get("Items", []))
        }
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}


# ---- UPDATE Config (store new version, keep max 3) ----
def update_config(event, context):
    try:
        body = json.loads(event["body"])

        # fetch existing versions
        existing = table.query(
            KeyConditionExpression=Key("id").eq(HOMEPAGE_ID),
            ScanIndexForward=False
        ).get("Items", [])

        # determine new version number
        new_version = (existing[0]["version"] + 1) if existing else 1

        # save new version
        item = {
            "id": HOMEPAGE_ID,
            "version": new_version,
            "timestamp": datetime.utcnow().isoformat(),
            "content": body
        }
        table.put_item(Item=item)

        # keep only last 3
        if len(existing) >= 3:
            oldest = min(existing, key=lambda x: x["version"])
            table.delete_item(Key={"id": HOMEPAGE_ID, "version": oldest["version"]})

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Homepage config updated", "data": item})
        }
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}


# ---- DELETE all configs ----
def delete_config(event, context):
    try:
        response = table.query(
            KeyConditionExpression=Key("id").eq(HOMEPAGE_ID)
        )
        for item in response.get("Items", []):
            table.delete_item(Key={"id": HOMEPAGE_ID, "version": item["version"]})
        return {"statusCode": 200, "body": json.dumps({"message": "All versions deleted"})}
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}
