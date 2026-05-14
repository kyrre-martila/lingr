# Lingr — Data Model

PostgreSQL schema specification

---

# Design Principles

- All business logic enforced server-side
- Layer progression calculated server-side only
- Discovery never exposes raw user identity
- Sensitive data hidden until Layer permissions allow exposure
- UUIDs used for all public-facing entities
- Soft deletes used where historical continuity matters
- All timestamps stored in UTC (TIMESTAMPTZ)
- All media served through signed temporary URLs
- Discovery IDs are temporary abstraction IDs, never actual user IDs

---

# Extensions

sql CREATE EXTENSION IF NOT EXISTS pgcrypto; 

Required for:

- gen_random_uuid()

---

# Tables

---

# users

Core authentication and account state.

Profile information lives separately in user_profiles.

sql CREATE TABLE users (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    email                   TEXT UNIQUE,   apple_id                TEXT UNIQUE,   google_id               TEXT UNIQUE,    password_hash           TEXT,    is_verified             BOOLEAN NOT NULL DEFAULT FALSE,   is_active               BOOLEAN NOT NULL DEFAULT TRUE,    subscription_tier       TEXT NOT NULL DEFAULT 'free',   subscription_ends_at    TIMESTAMPTZ,    onboarding_complete     BOOLEAN NOT NULL DEFAULT FALSE,    last_active_at          TIMESTAMPTZ,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   deleted_at              TIMESTAMPTZ,    CONSTRAINT auth_provider_required CHECK (     email IS NOT NULL     OR apple_id IS NOT NULL     OR google_id IS NOT NULL   ) ); 

## Rules

- password_hash only used for email/password auth
- Users are soft deleted via deleted_at
- onboarding_complete becomes TRUE only after:
  - required profile fields completed
  - minimum one active Glimps exists
- Deleted users later anonymized and hard deleted by cleanup job

---

# user_profiles

Extended profile data.

Separated from auth table to keep authentication concerns isolated.

sql CREATE TABLE user_profiles (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    display_name            TEXT,   birth_year              INTEGER,    gender                  TEXT,   seeking                 TEXT[],    city                    TEXT,   country                 TEXT,    latitude                DECIMAL(9,6),   longitude               DECIMAL(9,6),    reflection              TEXT,    connection_type         TEXT,    recharge_styles         TEXT[],   values                  TEXT[],    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),    CONSTRAINT unique_user_profile UNIQUE (user_id) ); 

## Rules

- Raw coordinates never exposed to client
- City only visible at Layer 1+
- birth_year never exposed directly
- API converts birth year into approximate age ranges:
  - "mid 20s"
  - "late 30s"
- values and recharge_styles influence discovery generation

---

# glimps

A Glimps is a unified emotional moment.

Contains:

- image/video
- reflection text
- optional audio

sql CREATE TABLE glimps (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    media_type              TEXT NOT NULL,   media_file_id           UUID NOT NULL REFERENCES media_files(id),    text_overlay            TEXT,    audio_file_id           UUID REFERENCES media_files(id),   audio_label             TEXT,    is_active               BOOLEAN NOT NULL DEFAULT TRUE,    sort_order              INTEGER NOT NULL DEFAULT 0,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW() );  CREATE INDEX idx_glimps_user ON glimps(user_id); 

## Rules

- Max 3 active Glimps per user
- Minimum 1 active Glimps required before discovery eligibility
- Glimps should prioritize atmosphere over self-presentation
- Media files referenced through media_files
- API generates signed temporary media URLs dynamically

---

# sparks

One-directional intentional interest signal.

Mutual Sparks create a Connection.

sql CREATE TABLE sparks (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    sender_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   receiver_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    status                  TEXT NOT NULL DEFAULT 'pending',    seen_by_receiver        BOOLEAN NOT NULL DEFAULT FALSE,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),    CONSTRAINT no_self_spark     CHECK (sender_id != receiver_id),    CONSTRAINT unique_spark     UNIQUE (sender_id, receiver_id) );  CREATE INDEX idx_sparks_receiver ON sparks(receiver_id, status);  CREATE INDEX idx_sparks_sender ON sparks(sender_id); 

## Rules

- Sender identity hidden until mutual Spark
- Receiver sees emotional profile only
- Daily limits enforced server-side:
  - free: 1/day
  - paid: 5/day
- Passed Sparks hidden from both users
- Old passed Sparks cleaned up automatically

---

# connections

Created automatically after mutual Sparks.

Represents an active relationship space between two users.

sql CREATE TABLE connections (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    user_a_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   user_b_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    current_layer           INTEGER NOT NULL DEFAULT 1,    window_active           BOOLEAN NOT NULL DEFAULT FALSE,    window_opted_a          BOOLEAN NOT NULL DEFAULT FALSE,   window_opted_b          BOOLEAN NOT NULL DEFAULT FALSE,    last_activity_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   deleted_at              TIMESTAMPTZ,    CONSTRAINT no_self_connection     CHECK (user_a_id != user_b_id),    CONSTRAINT unique_connection     UNIQUE (       LEAST(user_a_id::TEXT, user_b_id::TEXT),       GREATEST(user_a_id::TEXT, user_b_id::TEXT)     ) );  CREATE INDEX idx_connections_user_a ON connections(user_a_id);  CREATE INDEX idx_connections_user_b ON connections(user_b_id); 

## Rules

- user_a_id always lexicographically smaller UUID
- current_layer is a cached convenience value
- Source of truth is layer_progress
- Window only becomes active when both users opt in
- Connections soft deleted to preserve historical continuity

---

# layer_progress

Tracks progression metrics used to calculate Layers.

sql CREATE TABLE layer_progress (   id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),    connection_id               UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,    message_count               INTEGER NOT NULL DEFAULT 0,    user_a_active_days          INTEGER NOT NULL DEFAULT 0,   user_b_active_days          INTEGER NOT NULL DEFAULT 0,    user_a_pulse_answers        INTEGER NOT NULL DEFAULT 0,   user_b_pulse_answers        INTEGER NOT NULL DEFAULT 0,    last_calculated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),    CONSTRAINT unique_layer_progress     UNIQUE (connection_id) ); 

## Rules

Layer progression calculated server-side only.

connections.current_layer is updated as cached state after recalculation.

Initial thresholds:

txt Layer 1 → 2 - 20 messages - 3 active days each - 1 pulse answer each  Layer 2 → 3 - 60 messages - 7 active days each - 3 pulse answers each  Layer 3 → 4 - 120 messages - 14 active days each - 5 pulse answers each - mutual Window opt-in required 

Thresholds expected to evolve after observing real user behavior.

---

# messages

Messages exchanged inside Connections.

sql CREATE TABLE messages (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    connection_id           UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,    sender_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    content                 TEXT,    media_file_id           UUID REFERENCES media_files(id),   media_type              TEXT,    is_read                 BOOLEAN NOT NULL DEFAULT FALSE,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   deleted_at              TIMESTAMPTZ,    CONSTRAINT message_content_required CHECK (     content IS NOT NULL     OR media_file_id IS NOT NULL   ) );  CREATE INDEX idx_messages_connection_created ON messages(connection_id, created_at);  CREATE INDEX idx_messages_sender ON messages(sender_id); 

## Rules

- Messages soft deleted only
- Deleted messages anonymized later
- Voice messages restricted to paid users
- Pagination should use:
  - created_at
  - id
  composite cursor strategy

---

# pulse_questions

Daily reflection question pool.

sql CREATE TABLE pulse_questions (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    question                TEXT NOT NULL,    is_active               BOOLEAN NOT NULL DEFAULT TRUE,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW() ); 

## Example Questions

txt What made you feel calm today? What stayed on your mind today? What felt meaningful today? What made you smile today? What did you notice today that you usually overlook? 

---

# pulse_answers

User responses to daily Pulse prompts.

sql CREATE TABLE pulse_answers (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    question_id             UUID NOT NULL REFERENCES pulse_questions(id),    answer                  TEXT NOT NULL,    answer_date             DATE NOT NULL DEFAULT CURRENT_DATE,    answered_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),    CONSTRAINT unique_daily_pulse     UNIQUE (user_id, answer_date) );  CREATE INDEX idx_pulse_answers_user ON pulse_answers(user_id, answered_at); 

## Rules

- One Pulse answer per user per day
- Shared Pulse history visible at Layer 3+
- Pulse should feel reflective, not gamified

---

# daily_discovery

Pre-generated daily discovery queue.

sql CREATE TABLE daily_discovery (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    viewer_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    shown_user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    discovery_date          DATE NOT NULL DEFAULT CURRENT_DATE,    was_sparked             BOOLEAN NOT NULL DEFAULT FALSE,   was_passed              BOOLEAN NOT NULL DEFAULT FALSE,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),    CONSTRAINT unique_daily_pair     UNIQUE (       viewer_id,       shown_user_id,       discovery_date     ) );  CREATE INDEX idx_daily_discovery_viewer ON daily_discovery(viewer_id, discovery_date); 

## Rules

Generated nightly by background job.

Discovery logic considers:

- location radius
- values overlap
- recharge compatibility
- connection intentions
- activity quality

Discovery excludes:

- previous passes
- existing connections
- recent repeats
- blocked users
- deleted users

---

# media_files

Tracks uploaded media.

Allows:

- cleanup
- signed URL generation
- storage abstraction

sql CREATE TABLE media_files (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    storage_key             TEXT NOT NULL,    file_type               TEXT NOT NULL,    mime_type               TEXT,   file_size               INTEGER,    duration_seconds        INTEGER,    context                 TEXT,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),   deleted_at              TIMESTAMPTZ );  CREATE INDEX idx_media_files_user ON media_files(user_id); 

## Rules

- Media never exposed through permanent public URLs
- Signed URLs generated dynamically by API
- Storage backend abstracted for future:
  - local storage
  - S3
  - Cloudflare R2
- Orphaned files cleaned by scheduled jobs

---

# refresh_tokens

Refresh token persistence.

sql CREATE TABLE refresh_tokens (   id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    token_hash              TEXT NOT NULL UNIQUE,    device_info             TEXT,    expires_at              TIMESTAMPTZ NOT NULL,   revoked_at              TIMESTAMPTZ,    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW() );  CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id); 

## Rules

- Store hashes only
- Rotate refresh token on every refresh request
- Revoke all tokens after password reset
- Expired/revoked tokens cleaned nightly

---

# Entity Relationship Summary

txt users  ├── user_profiles (1:1)  ├── glimps (1:many)  ├── sparks_sent (1:many)  ├── sparks_received (1:many)  ├── connections (many:many via connections)  ├── messages (1:many)  ├── pulse_answers (1:many)  ├── daily_discovery (1:many)  ├── media_files (1:many)  └── refresh_tokens (1:many)  connections  ├── layer_progress (1:1)  └── messages (1:many) 

---

# Security Notes

- Discovery never exposes real user IDs
- Raw coordinates never exposed to clients
- Media served only through signed temporary URLs
- Layer checks enforced server-side on every request
- All queries scoped to authenticated user access
- Sensitive profile fields hidden until permitted Layer
- Signed URLs should expire after 1 hour by default

---

# Cleanup Jobs

Recommended scheduled cleanup jobs:

txt Deleted users: - hard delete after 30 days  Expired refresh tokens: - delete after 7 days  Old passed Sparks: - delete after 60 days  Old daily_discovery records: - delete after 90 days  Orphaned media: - periodic cleanup 

---

# Future Expansion Notes

Likely future additions:

- user blocking/reporting
- moderation queue
- push notifications
- subscriptions table
- analytics events
- date planning inside Window
- shared memory timeline
- AI-assisted safety moderation

Current schema intentionally optimized for:

- MVP simplicity
- emotional pacing
- privacy-first discovery
- gradual identity reveal

---

Document version: 1.1
