-- Deduplicate existing rows before enforcing uniqueness.
DELETE FROM product_events a
USING product_events b
WHERE a.id < b.id
  AND a."userId" = b."userId"
  AND a."eventType" = b."eventType";

CREATE UNIQUE INDEX product_events_user_id_event_type_key
  ON product_events("userId", "eventType");
