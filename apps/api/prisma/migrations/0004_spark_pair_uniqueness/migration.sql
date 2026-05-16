ALTER TABLE "sparks"
  ADD COLUMN "pairMinUserId" TEXT,
  ADD COLUMN "pairMaxUserId" TEXT;

UPDATE "sparks"
SET
  "pairMinUserId" = LEAST("initiatorUserId", "recipientUserId"),
  "pairMaxUserId" = GREATEST("initiatorUserId", "recipientUserId");

ALTER TABLE "sparks"
  ALTER COLUMN "pairMinUserId" SET NOT NULL,
  ALTER COLUMN "pairMaxUserId" SET NOT NULL;

CREATE INDEX "sparks_pairMinUserId_pairMaxUserId_status_idx" ON "sparks"("pairMinUserId", "pairMaxUserId", "status");
CREATE UNIQUE INDEX "sparks_active_pair_unique_idx" ON "sparks"("pairMinUserId", "pairMaxUserId") WHERE "status" IN ('invited', 'accepted', 'paused');
