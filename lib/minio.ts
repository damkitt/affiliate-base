import { Client } from "minio";

if (
  !process.env.MINIO_PUBLIC_URL ||
  !process.env.MINIO_ACCESS_KEY ||
  !process.env.MINIO_SECRET_KEY
) {
  throw new Error("MinIO environment variables are not set");
}

const minioUrl = new URL(process.env.MINIO_PUBLIC_URL);

export const minioClient = new Client({
  endPoint: minioUrl.hostname,
  port: Number.parseInt(minioUrl.port) || 9000,
  useSSL: minioUrl.protocol === "https:",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

export const AVATAR_BUCKET =
  process.env.MINIO_AVATAR_BUCKET || "affiliate-base-avatars";
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL;
