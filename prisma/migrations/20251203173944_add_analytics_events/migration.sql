-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "program_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL DEFAULT 'view',
    "fingerprint" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "analytics_events_program_id_idx" ON "analytics_events"("program_id");

-- CreateIndex
CREATE INDEX "analytics_events_program_id_fingerprint_idx" ON "analytics_events"("program_id", "fingerprint");

-- CreateIndex
CREATE INDEX "analytics_events_program_id_created_at_idx" ON "analytics_events"("program_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_fingerprint_ip_hash_program_id_idx" ON "analytics_events"("fingerprint", "ip_hash", "program_id");
