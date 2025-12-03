/*
  Warnings:

  - The primary key for the `Program` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `additionalInfo` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateUrl` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `affiliatesCount` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `avgOrderValue` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `brandAge` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `clickCount` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `cookieDuration` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `logoBase64` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `minPayout` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `payoutMethod` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `payoutsLast30Days` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `payoutsTotal` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `randomWeight` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `targetAudience` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `usersTotal` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrl` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `xHandle` on the `Program` table. All the data in the column will be lost.
  - You are about to alter the column `commissionRate` on the `Program` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `affiliate_url` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website_url` to the `Program` table without a default value. This is not possible if the table is not empty.

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
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "approval_status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Program" ("category", "commissionRate", "country", "description", "email", "id", "tagline", "updatedAt") SELECT "category", "commissionRate", "country", "description", "email", "id", "tagline", "updatedAt" FROM "Program";
DROP TABLE "Program";
ALTER TABLE "new_Program" RENAME TO "Program";
CREATE UNIQUE INDEX "Program_program_name_key" ON "Program"("program_name");
CREATE UNIQUE INDEX "Program_website_url_key" ON "Program"("website_url");
CREATE UNIQUE INDEX "Program_affiliate_url_key" ON "Program"("affiliate_url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
