CREATE TYPE "GlimpsState" AS ENUM ('draft', 'published', 'expired', 'archived');

CREATE TABLE "glimpses" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "reflection" TEXT NOT NULL,
  "mood" TEXT NOT NULL,
  "prompt" TEXT,
  "imageNote" TEXT,
  "privacy" TEXT NOT NULL,
  "emotionalTone" TEXT NOT NULL,
  "state" "GlimpsState" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "archivedAt" TIMESTAMP(3),
  CONSTRAINT "glimpses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "glimpses_userId_state_createdAt_idx" ON "glimpses"("userId", "state", "createdAt");
