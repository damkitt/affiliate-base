-- CreateEnum
CREATE TYPE "Country" AS ENUM ('US', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'PT', 'IE', 'RU', 'UA', 'CA', 'MX', 'BR', 'AR', 'CO', 'CL', 'AU', 'NZ', 'JP', 'KR', 'CN', 'HK', 'SG', 'IN', 'ID', 'TH', 'VN', 'MY', 'PH', 'AE', 'SA', 'IL', 'TR', 'EG', 'ZA', 'NG', 'KE', 'Other');

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL DEFAULT 'view',
    "fingerprint" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "program_name" TEXT NOT NULL DEFAULT 'N/A',
    "tagline" TEXT NOT NULL DEFAULT 'No tagline provided.',
    "description" TEXT NOT NULL DEFAULT 'No description provided.',
    "category" TEXT NOT NULL DEFAULT 'Not specified',
    "website_url" TEXT NOT NULL,
    "affiliate_url" TEXT NOT NULL,
    "country" "Country" NOT NULL DEFAULT 'Other',
    "x_handle" TEXT,
    "email" TEXT,
    "logo_url" TEXT,
    "commissionRate" INTEGER NOT NULL DEFAULT 0,
    "commission_duration" TEXT,
    "cookie_duration" INTEGER,
    "payout_method" TEXT,
    "min_payout_value" INTEGER,
    "avg_order_value" INTEGER,
    "target_audience" TEXT,
    "additional_info" TEXT,
    "affiliates_count_range" TEXT,
    "payouts_total_range" TEXT,
    "founding_date" TIMESTAMP(3),
    "approval_time_range" TEXT,
    "approval_status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_program_id_idx" ON "analytics_events"("program_id");

-- CreateIndex
CREATE INDEX "analytics_events_program_id_fingerprint_idx" ON "analytics_events"("program_id", "fingerprint");

-- CreateIndex
CREATE INDEX "analytics_events_program_id_created_at_idx" ON "analytics_events"("program_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_fingerprint_ip_hash_program_id_idx" ON "analytics_events"("fingerprint", "ip_hash", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "Program_program_name_key" ON "Program"("program_name");

-- CreateIndex
CREATE UNIQUE INDEX "Program_website_url_key" ON "Program"("website_url");

-- CreateIndex
CREATE UNIQUE INDEX "Program_affiliate_url_key" ON "Program"("affiliate_url");
