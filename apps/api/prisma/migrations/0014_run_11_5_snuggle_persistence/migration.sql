CREATE TABLE "snuggle_sessions" (
  "id" TEXT NOT NULL,
  "appSessionId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "holdByInviter" BOOLEAN NOT NULL DEFAULT false,
  "holdByInvitee" BOOLEAN NOT NULL DEFAULT false,
  "sharedMomentState" TEXT NOT NULL,
  "completionReason" TEXT,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "snuggle_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "snuggle_sessions_appSessionId_key" ON "snuggle_sessions"("appSessionId");
CREATE INDEX "snuggle_sessions_conversationId_createdAt_idx" ON "snuggle_sessions"("conversationId", "createdAt" DESC);

ALTER TABLE "snuggle_sessions" ADD CONSTRAINT "snuggle_sessions_appSessionId_fkey" FOREIGN KEY ("appSessionId") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "snuggle_sessions" ADD CONSTRAINT "snuggle_sessions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
