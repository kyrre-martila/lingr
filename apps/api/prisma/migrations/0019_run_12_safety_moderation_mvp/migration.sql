CREATE TYPE "UserReportCategory" AS ENUM ('uncomfortable', 'inappropriate', 'fake_profile', 'harassment', 'other');
CREATE TYPE "ConversationSafetyReason" AS ENUM ('user_paused', 'blocked_user');
CREATE TYPE "ModerationEventType" AS ENUM ('user_blocked', 'user_reported', 'conversation_paused');

CREATE TABLE "user_reports" (
  "id" TEXT NOT NULL,
  "reporterUserId" TEXT NOT NULL,
  "reportedUserId" TEXT NOT NULL,
  "conversationId" TEXT,
  "category" "UserReportCategory" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_safety_states" (
  "conversationId" TEXT NOT NULL,
  "isPaused" BOOLEAN NOT NULL DEFAULT false,
  "initiatedByUserId" TEXT,
  "reason" "ConversationSafetyReason",
  "pausedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "conversation_safety_states_pkey" PRIMARY KEY ("conversationId")
);

CREATE TABLE "moderation_events" (
  "id" TEXT NOT NULL,
  "type" "ModerationEventType" NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "targetUserId" TEXT,
  "conversationId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "moderation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_reports_reporterUserId_createdAt_idx" ON "user_reports"("reporterUserId", "createdAt");
CREATE INDEX "user_reports_reportedUserId_createdAt_idx" ON "user_reports"("reportedUserId", "createdAt");
CREATE INDEX "moderation_events_type_createdAt_idx" ON "moderation_events"("type", "createdAt");
CREATE INDEX "moderation_events_targetUserId_createdAt_idx" ON "moderation_events"("targetUserId", "createdAt");
