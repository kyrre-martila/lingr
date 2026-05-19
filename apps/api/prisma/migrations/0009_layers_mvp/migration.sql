CREATE TABLE IF NOT EXISTS relationship_layers (
  id TEXT PRIMARY KEY,
  primary_user_id TEXT NOT NULL,
  secondary_user_id TEXT NOT NULL,
  current_layer INTEGER NOT NULL DEFAULT 0,
  reciprocal_message_count INTEGER NOT NULL DEFAULT 0,
  last_message_sender_id TEXT,
  layer1_unlocked_at TIMESTAMP(3),
  layer2_unlocked_at TIMESTAMP(3),
  layer3_unlocked_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT relationship_layers_primary_user_id_fkey FOREIGN KEY (primary_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT relationship_layers_secondary_user_id_fkey FOREIGN KEY (secondary_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS relationship_layers_primary_user_id_secondary_user_id_key
ON relationship_layers(primary_user_id, secondary_user_id);

CREATE INDEX IF NOT EXISTS relationship_layers_pair_layer_idx
ON relationship_layers(primary_user_id, secondary_user_id, current_layer);
