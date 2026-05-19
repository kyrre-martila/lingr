CREATE TABLE "guess_me_sessions" (
  "id" TEXT NOT NULL,
  "appSessionId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "promptId" TEXT NOT NULL,
  "promptKey" TEXT NOT NULL,
  "optionKeys" TEXT[],
  "ownAnswerByInviter" TEXT,
  "ownAnswerByInvitee" TEXT,
  "guessByInviter" TEXT,
  "guessByInvitee" TEXT,
  "revealState" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "guess_me_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "guess_me_sessions_appSessionId_key" ON "guess_me_sessions"("appSessionId");
CREATE INDEX "guess_me_sessions_conversationId_createdAt_idx" ON "guess_me_sessions"("conversationId", "createdAt" DESC);

ALTER TABLE "guess_me_sessions" ADD CONSTRAINT "guess_me_sessions_appSessionId_fkey" FOREIGN KEY ("appSessionId") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guess_me_sessions" ADD CONSTRAINT "guess_me_sessions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
