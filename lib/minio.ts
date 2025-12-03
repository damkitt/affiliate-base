/**
 * MinIO Client Configuration
 * 
 * Provides a configured MinIO client for object storage operations.
 * Used for storing program logos and other assets.
 */

import { Client } from "minio";

// =============================================================================
// Environment Validation
// =============================================================================

const requiredEnvVars = [
  "MINIO_PUBLIC_URL",
  "MINIO_ACCESS_KEY", 
  "MINIO_SECRET_KEY",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// =============================================================================
// Client Configuration
// =============================================================================

const minioUrl = new URL(process.env.MINIO_PUBLIC_URL!);

export const minioClient = new Client({
  endPoint: minioUrl.hostname,
  port: Number.parseInt(minioUrl.port) || 9000,
  useSSL: minioUrl.protocol === "https:",
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

// =============================================================================
// Constants
// =============================================================================

export const AVATAR_BUCKET = process.env.MINIO_AVATAR_BUCKET ?? "affiliate-base-avatars";
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL;
