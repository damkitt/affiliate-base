/**
 * Avatar Upload API
 * 
 * Handles program logo uploads to MinIO storage.
 * Validates file type and size before upload.
 */

import { NextRequest, NextResponse } from "next/server";
import { minioClient, AVATAR_BUCKET, MINIO_PUBLIC_URL } from "@/lib/minio";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

// =============================================================================
// Constants
// =============================================================================

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// =============================================================================
// Types
// =============================================================================

interface UploadResponse {
  url: string;
}

interface ErrorResponse {
  error: string;
}

// =============================================================================
// Helpers
// =============================================================================

function getFileExtension(filename: string): string {
  return filename.split(".").pop() ?? "png";
}

async function ensureBucketExists(): Promise<void> {
  const exists = await minioClient.bucketExists(AVATAR_BUCKET);
  if (exists) return;

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

// =============================================================================
// Handler
// =============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    await ensureBucketExists();

    // Generate unique filename
    const extension = getFileExtension(file.name);
    const filename = `${randomUUID()}.${extension}`;

    // Upload to MinIO
    const buffer = Buffer.from(await file.arrayBuffer());

    // Compress and resize image
    const processedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ quality: 85 })
      .toBuffer();

    await minioClient.putObject(AVATAR_BUCKET, filename, processedBuffer, processedBuffer.length, {
      "Content-Type": "image/png",
    });

    const baseUrl = MINIO_PUBLIC_URL.replace(/\/$/, "");
    const publicUrl = `${baseUrl}/${AVATAR_BUCKET}/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("[Upload] Error uploading to MinIO:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
