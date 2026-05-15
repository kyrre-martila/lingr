CREATE TYPE "SparkState" AS ENUM ('potential', 'invited', 'accepted', 'paused', 'declined', 'expired');

CREATE TABLE "sparks" (
  "id" TEXT PRIMARY KEY,
  "initiatorUserId" TEXT NOT NULL,
  "recipientUserId" TEXT NOT NULL,
  "status" "SparkState" NOT NULL DEFAULT 'invited',
  "sourceGlimpsId" TEXT,
  "softResonanceContext" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "respondedAt" TIMESTAMP(3),
  "pausedAt" TIMESTAMP(3),
  "declinedAt" TIMESTAMP(3),
  "expiredAt" TIMESTAMP(3),
  CONSTRAINT "sparks_initiatorUserId_fkey" FOREIGN KEY ("initiatorUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sparks_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sparks_sourceGlimpsId_fkey" FOREIGN KEY ("sourceGlimpsId") REFERENCES "glimpses"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "sparks_initiatorUserId_recipientUserId_status_idx" ON "sparks"("initiatorUserId", "recipientUserId", "status");
CREATE INDEX "sparks_recipientUserId_status_createdAt_idx" ON "sparks"("recipientUserId", "status", "createdAt");
