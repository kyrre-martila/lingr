ALTER TABLE "users"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "passwordHash" TEXT;

UPDATE "users"
SET "email" = CONCAT('legacy+', "id", '@lingr.local'),
    "passwordHash" = '$2b$12$QfJ6l4r2dM9R87qFvP0E8uNEA8MSK4xB2xjWJvNolWb1b5rO6x3k2';

ALTER TABLE "users"
  ALTER COLUMN "email" SET NOT NULL,
  ALTER COLUMN "passwordHash" SET NOT NULL;

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

ALTER TABLE "sessions"
  ADD COLUMN "tokenHash" TEXT;

UPDATE "sessions"
SET "tokenHash" = CONCAT('legacy_', "id");

ALTER TABLE "sessions"
  ALTER COLUMN "tokenHash" SET NOT NULL;

CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");
