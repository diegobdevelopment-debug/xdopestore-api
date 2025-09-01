import boto3
import json
import os
import base64
import uuid

s3 = boto3.client("s3")
BUCKET_NAME = os.environ["MEDIA_BUCKET"]

def upload_image(event, context):
    """
    Uploads a base64 encoded image to S3 and returns its URL
    """
    try:
        body = json.loads(event["body"])
        image_data = body["image"]  # base64 string
        extension = body.get("extension", "png")

        file_name = f"uploads/{uuid.uuid4()}.{extension}"
        image_bytes = base64.b64decode(image_data)

        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=file_name,
            Body=image_bytes,
            ContentType=f"image/{extension}",
            ACL="public-read"  # or keep private + use signed URLs
        )

        file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}"

        return {
            "statusCode": 200,
            "body": json.dumps({"image_url": file_url})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
