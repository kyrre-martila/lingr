-- Run 5 foundation placeholder migration.
-- Generated manually as an initial baseline before product domain persistence.

CREATE TYPE "UserStatus" AS ENUM ('active', 'paused', 'deleted', 'restricted');
CREATE TYPE "SessionStatus" AS ENUM ('active', 'revoked', 'expired');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "authSubjectRef" TEXT UNIQUE,
  "status" "UserStatus" NOT NULL DEFAULT 'active',
  "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "pausedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3)
);

CREATE TABLE "profiles" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
  "visibility" TEXT NOT NULL DEFAULT 'discoverable',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "sessions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "status" "SessionStatus" NOT NULL DEFAULT 'active',
  "expiresAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "sessions_userId_status_idx" ON "sessions"("userId", "status");
