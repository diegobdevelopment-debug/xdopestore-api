import base64
import boto3
import uuid
import os

s3 = boto3.client("s3")
BUCKET = os.environ.get("MEDIA_BUCKET", "my-media-bucket")


def upload_image(file_content: bytes, file_extension: str) -> str:
    """
    Uploads an image to S3 and returns the public URL.
    """
    key = f"uploads/{uuid.uuid4()}.{file_extension}"

    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=file_content,
        ContentType=f"image/{file_extension}"
    )

    return f"https://{BUCKET}.s3.amazonaws.com/{key}"


def process_image_field(body: dict) -> dict:
    """
    If body contains base64 image data, upload to S3 and replace with image_url.
    """
    if "image_data" in body and "image_extension" in body:
        image_bytes = base64.b64decode(body["image_data"])
        extension = body["image_extension"]

        # upload and get URL
        image_url = upload_image(image_bytes, extension)

        # replace field
        body["image_url"] = image_url
        del body["image_data"]
        del body["image_extension"]

    return body