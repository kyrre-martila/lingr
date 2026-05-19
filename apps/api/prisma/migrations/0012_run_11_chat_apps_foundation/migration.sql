CREATE TYPE "AppId" AS ENUM ('match_cards', 'guess_me', 'snuggle', 'playing_now');
CREATE TYPE "AppSessionLifecycle" AS ENUM ('invite', 'accept', 'active', 'complete', 'dismissed');

CREATE TABLE "app_sessions" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "appId" "AppId" NOT NULL,
  "lifecycle" "AppSessionLifecycle" NOT NULL DEFAULT 'invite',
  "invitedByUserId" TEXT NOT NULL,
  "acceptedByUserId" TEXT,
  "completedByUserId" TEXT,
  "dismissedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "app_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "app_sessions_conversationId_createdAt_idx" ON "app_sessions"("conversationId", "createdAt" DESC);
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
