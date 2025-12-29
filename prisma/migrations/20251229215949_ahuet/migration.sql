/*
  Warnings:

  - You are about to drop the `analytics_events` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Program` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EventName" AS ENUM ('VIEW', 'CLICK', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('EDIT', 'REPORT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "featured_expires_at" TIMESTAMP(3),
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manual_score_boost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quality_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "total_views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trending_score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "analytics_events";

-- CreateTable
CREATE TABLE "traffic_logs" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "ip" TEXT,
    "visitor_id" TEXT,
    "program_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_events" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date_key" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results_count" INTEGER NOT NULL,
    "session_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_reports" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'EDIT',
    "reason" TEXT,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "is_founder" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "program_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "traffic_logs_created_at_idx" ON "traffic_logs"("created_at");

-- CreateIndex
CREATE INDEX "traffic_logs_country_created_at_idx" ON "traffic_logs"("country", "created_at");

-- CreateIndex
CREATE INDEX "program_events_program_id_type_date_key_idx" ON "program_events"("program_id", "type", "date_key");

-- CreateIndex
CREATE INDEX "program_events_created_at_idx" ON "program_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "program_events_program_id_visitor_id_type_date_key_key" ON "program_events"("program_id", "visitor_id", "type", "date_key");

-- CreateIndex
CREATE INDEX "search_logs_query_idx" ON "search_logs"("query");

-- CreateIndex
CREATE INDEX "search_logs_created_at_idx" ON "search_logs"("created_at");

-- CreateIndex
CREATE INDEX "search_logs_results_count_idx" ON "search_logs"("results_count");

-- CreateIndex
CREATE INDEX "program_reports_program_id_idx" ON "program_reports"("program_id");

-- CreateIndex
CREATE INDEX "program_reports_status_idx" ON "program_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_approval_status_trending_score_created_at_idx" ON "Program"("approval_status", "trending_score", "created_at");

-- CreateIndex
CREATE INDEX "Program_is_featured_featured_expires_at_idx" ON "Program"("is_featured", "featured_expires_at");

-- CreateIndex
CREATE INDEX "Program_program_name_category_idx" ON "Program"("program_name", "category");

-- AddForeignKey
ALTER TABLE "program_events" ADD CONSTRAINT "program_events_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_reports" ADD CONSTRAINT "program_reports_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
