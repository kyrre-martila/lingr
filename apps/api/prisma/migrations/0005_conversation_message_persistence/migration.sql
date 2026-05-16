CREATE TYPE "ConversationState" AS ENUM ('active', 'paused', 'closed');
CREATE TYPE "ConversationParticipantRole" AS ENUM ('member', 'system');
CREATE TYPE "MessageType" AS ENUM ('text', 'system', 'layer_unlock', 'playing_now', 'app_invite');
CREATE TYPE "MessageVisibility" AS ENUM ('conversation', 'soft_banner');
CREATE TYPE "MessageDeliveryState" AS ENUM ('queued', 'sent', 'failed');

CREATE TABLE "conversations" (
  "id" TEXT NOT NULL,
  "sparkId" TEXT NOT NULL,
  "state" "ConversationState" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_participants" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "ConversationParticipantRole" NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "senderUserId" TEXT,
  "type" "MessageType" NOT NULL,
  "visibility" "MessageVisibility" NOT NULL DEFAULT 'conversation',
  "deliveryState" "MessageDeliveryState" NOT NULL DEFAULT 'sent',
  "content" JSONB NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversations_sparkId_key" ON "conversations"("sparkId");
CREATE INDEX "conversations_state_updatedAt_idx" ON "conversations"("state", "updatedAt");
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants"("conversationId", "userId");
CREATE INDEX "conversation_participants_userId_joinedAt_idx" ON "conversation_participants"("userId", "joinedAt");
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt" DESC);

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_sparkId_fkey" FOREIGN KEY ("sparkId") REFERENCES "sparks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
