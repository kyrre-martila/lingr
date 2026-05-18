CREATE TYPE "RegionLaunchStatus" AS ENUM ('closed', 'waitlist', 'open', 'paused');

CREATE TABLE "countries" (
  "id" TEXT PRIMARY KEY,
  "isoCode" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "regions" (
  "id" TEXT PRIMARY KEY,
  "countryId" TEXT NOT NULL REFERENCES "countries"("id") ON DELETE CASCADE,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "launchStatus" "RegionLaunchStatus" NOT NULL DEFAULT 'closed',
  "launchDate" TIMESTAMP(3),
  "isOpen" BOOLEAN NOT NULL DEFAULT false,
  "voteCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  UNIQUE ("countryId", "slug")
);

CREATE TABLE "region_interest_votes" (
  "id" TEXT PRIMARY KEY,
  "regionId" TEXT NOT NULL REFERENCES "regions"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "firstName" TEXT,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("regionId", "email")
);
