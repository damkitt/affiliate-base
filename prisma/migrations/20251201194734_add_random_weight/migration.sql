-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Program" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "xHandle" TEXT,
    "email" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "randomWeight" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Program" ("affiliateUrl", "category", "clickCount", "country", "createdAt", "description", "email", "id", "name", "tagline", "updatedAt", "websiteUrl", "xHandle") SELECT "affiliateUrl", "category", "clickCount", "country", "createdAt", "description", "email", "id", "name", "tagline", "updatedAt", "websiteUrl", "xHandle" FROM "Program";
DROP TABLE "Program";
ALTER TABLE "new_Program" RENAME TO "Program";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
