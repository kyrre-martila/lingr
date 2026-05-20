-- Bring profile table in sync with schema.prisma after earlier additive profile expansions.
ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "pronouns" TEXT,
  ADD COLUMN IF NOT EXISTS "ageRange" TEXT,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "layersSummary" TEXT,
  ADD COLUMN IF NOT EXISTS "locationRegion" TEXT,
  ADD COLUMN IF NOT EXISTS "broadRegion" TEXT,
  ADD COLUMN IF NOT EXISTS "avatarAssetId" TEXT;
