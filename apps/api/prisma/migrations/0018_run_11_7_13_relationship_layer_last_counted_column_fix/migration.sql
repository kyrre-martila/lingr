DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'relationship_layers' AND column_name = 'lastCountedMessageAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'relationship_layers' AND column_name = 'last_counted_message_at'
  ) THEN
    ALTER TABLE "relationship_layers" RENAME COLUMN "lastCountedMessageAt" TO "last_counted_message_at";
  END IF;
END $$;

ALTER TABLE "relationship_layers"
  ADD COLUMN IF NOT EXISTS "last_counted_message_at" TIMESTAMP(3);
