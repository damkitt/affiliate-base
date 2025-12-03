import { Client } from "minio";

export const AVATAR_BUCKET = process.env.MINIO_AVATAR_BUCKET!;
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL!;

export const minioClient = new Client({
  endPoint: new URL(MINIO_PUBLIC_URL).hostname,
  port: Number.parseInt(new URL(MINIO_PUBLIC_URL).port),
  useSSL: new URL(MINIO_PUBLIC_URL).protocol === "https:",
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});
