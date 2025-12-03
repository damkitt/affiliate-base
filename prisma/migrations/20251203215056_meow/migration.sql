/*
  Warnings:

  - You are about to drop the column `clicks_count` on the `Program` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "program_name" TEXT NOT NULL DEFAULT 'N/A',
    "tagline" TEXT NOT NULL DEFAULT 'No tagline provided.',
    "description" TEXT NOT NULL DEFAULT 'No description provided.',
    "category" TEXT NOT NULL DEFAULT 'Not specified',
    "website_url" TEXT NOT NULL,
    "affiliate_url" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Other',
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
    "founding_date" DATETIME,
    "approval_time_range" TEXT,
    "approval_status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Program" ("additional_info", "affiliate_url", "affiliates_count_range", "approval_status", "approval_time_range", "avg_order_value", "category", "commissionRate", "commission_duration", "cookie_duration", "country", "created_at", "description", "email", "founding_date", "id", "logo_url", "min_payout_value", "payout_method", "payouts_total_range", "program_name", "tagline", "target_audience", "updatedAt", "website_url", "x_handle") SELECT "additional_info", "affiliate_url", "affiliates_count_range", "approval_status", "approval_time_range", "avg_order_value", "category", "commissionRate", "commission_duration", "cookie_duration", "country", "created_at", "description", "email", "founding_date", "id", "logo_url", "min_payout_value", "payout_method", "payouts_total_range", "program_name", "tagline", "target_audience", "updatedAt", "website_url", "x_handle" FROM "Program";
DROP TABLE "Program";
ALTER TABLE "new_Program" RENAME TO "Program";
CREATE UNIQUE INDEX "Program_program_name_key" ON "Program"("program_name");
CREATE UNIQUE INDEX "Program_website_url_key" ON "Program"("website_url");
CREATE UNIQUE INDEX "Program_affiliate_url_key" ON "Program"("affiliate_url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
