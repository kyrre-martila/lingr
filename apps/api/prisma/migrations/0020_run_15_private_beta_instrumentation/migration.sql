CREATE TYPE "ProductEventType" AS ENUM (
  'onboarding_completed',
  'first_glimps_published',
  'first_spark_sent',
  'mutual_spark',
  'first_conversation_created',
  'first_message_sent',
  'emotional_feedback_submitted'
);

CREATE TYPE "EmotionalFeedbackTag" AS ENUM (
  'calm',
  'thoughtful',
  'overwhelming',
  'meaningful',
  'too_slow',
  'too_fast',
  'not_for_me'
);

CREATE TABLE "product_events" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventType" "ProductEventType" NOT NULL,
  "dayKey" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_events_userId_eventType_createdAt_idx" ON "product_events"("userId", "eventType", "createdAt");
CREATE INDEX "product_events_dayKey_eventType_idx" ON "product_events"("dayKey", "eventType");

CREATE TABLE "emotional_feedback" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tag" "EmotionalFeedbackTag" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emotional_feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "emotional_feedback_userId_createdAt_idx" ON "emotional_feedback"("userId", "createdAt");
CREATE INDEX "emotional_feedback_tag_createdAt_idx" ON "emotional_feedback"("tag", "createdAt");
