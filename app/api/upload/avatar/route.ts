import { NextRequest, NextResponse } from "next/server";
import { minioClient, AVATAR_BUCKET, MINIO_PUBLIC_URL } from "@/lib/minio";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(AVATAR_BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(AVATAR_BUCKET, "us-east-1");
      // Set bucket policy to public read
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${AVATAR_BUCKET}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(AVATAR_BUCKET, JSON.stringify(policy));
    }

    // Generate unique filename
    const extension = file.name.split(".").pop();
    const filename = `${randomUUID()}.${extension}`;

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to MinIO
    await minioClient.putObject(AVATAR_BUCKET, filename, buffer, file.size, {
      "Content-Type": file.type,
    });

    // Construct public URL
    const publicUrl = `${MINIO_PUBLIC_URL}/${AVATAR_BUCKET}/${filename}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading to MinIO:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
