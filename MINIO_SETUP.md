# MinIO Setup for Avatar Upload

## Configuration

Add these environment variables to your `.env` file:

```env
# MinIO Configuration
MINIO_PUBLIC_URL='http://57.129.86.35:9000'
MINIO_ACCESS_KEY='your-access-key'
MINIO_SECRET_KEY='your-secret-key'

# Buckets
MINIO_AVATAR_BUCKET='affiliate-base-avatars'
```

## Features

- ✅ Automatic bucket creation on first upload
- ✅ Public read policy for avatars
- ✅ File type validation (JPEG, PNG, WebP, GIF)
- ✅ File size limit: 5MB
- ✅ UUID-based filenames for uniqueness
- ✅ Real-time preview before upload
- ✅ Upload progress indicator

## API Endpoint

**POST** `/api/upload/avatar`

### Request

- Content-Type: `multipart/form-data`
- Body: `file` (File)

### Response

```json
{
  "url": "http://57.129.86.35:9000/affiliate-base-avatars/uuid.jpg"
}
```

### Error Responses

- `400` - No file provided / Invalid file type / File too large
- `500` - Upload failed

## Usage in Component

The upload is integrated into `AddProgramModal`:

1. Click on logo placeholder
2. Select image file
3. Preview appears immediately
4. File uploads to MinIO in background
5. URL saved to `formData.logoUrl`

## Bucket Policy

Automatically applied on bucket creation:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::affiliate-base-avatars/*"]
    }
  ]
}
```

This allows public read access to all objects in the bucket.
