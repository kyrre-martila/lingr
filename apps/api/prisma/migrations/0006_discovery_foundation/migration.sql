CREATE TABLE "block_relations" (
  "id" TEXT NOT NULL,
  "blockerUserId" TEXT NOT NULL,
  "blockedUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "block_relations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discovery_views" (
  "id" TEXT NOT NULL,
  "viewerUserId" TEXT NOT NULL,
  "discoveredUserId" TEXT NOT NULL,
  "firstSeenDayKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "discovery_views_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discovery_daily_trackers" (
  "id" TEXT NOT NULL,
  "viewerUserId" TEXT NOT NULL,
  "dayKey" TEXT NOT NULL,
  "introducedCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "discovery_daily_trackers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "block_relations_blockerUserId_blockedUserId_key" ON "block_relations"("blockerUserId", "blockedUserId");
CREATE INDEX "block_relations_blockedUserId_blockerUserId_idx" ON "block_relations"("blockedUserId", "blockerUserId");
CREATE UNIQUE INDEX "discovery_views_viewerUserId_discoveredUserId_key" ON "discovery_views"("viewerUserId", "discoveredUserId");
CREATE INDEX "discovery_views_viewerUserId_firstSeenDayKey_idx" ON "discovery_views"("viewerUserId", "firstSeenDayKey");
CREATE UNIQUE INDEX "discovery_daily_trackers_viewerUserId_dayKey_key" ON "discovery_daily_trackers"("viewerUserId", "dayKey");
CREATE INDEX "discovery_daily_trackers_viewerUserId_createdAt_idx" ON "discovery_daily_trackers"("viewerUserId", "createdAt");
