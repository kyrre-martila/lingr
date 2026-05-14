# Lingr — API Specification

Express.js REST API + Socket.io

---

# Base URL

txt id="1z0g4u" Development: http://localhost:3000/api  Production: https://api.lingr.app/api 

---

# API Principles

- REST-first architecture
- JWT authentication
- Short-lived access tokens
- Refresh token rotation
- Layer permissions enforced server-side
- Discovery never exposes raw user IDs
- All responses follow a consistent structure
- Socket.io used only for real-time experiences
- Business logic never trusted from client state

---

# Authentication

Protected routes require:

http id="y0b3sm" Authorization: Bearer <access_token> 

## Token Lifetimes

txt id="4e1jdr" Access token:   15 minutes Refresh token:  30 days 

## Refresh Flow

txt id="m7ij0x" Client receives 401 → POST /auth/refresh → API validates refresh token → old refresh token revoked → new access + refresh tokens issued 

## Security Rules

- Refresh tokens stored hashed in database
- Tokens never logged
- All refreshes rotate tokens
- Password reset revokes all refresh tokens
- Deleted accounts revoke all active sessions

---

# Standard Response Format

## Success

json id="9g0g64" {   "success": true,   "data": {} } 

## Error

json id="wjx5t4" {   "success": false,   "error": {     "code": "VALIDATION_ERROR",     "message": "Human readable message"   } } 

---

# Error Codes

txt id="g9apva" AUTH_REQUIRED AUTH_INVALID AUTH_FORBIDDEN  VALIDATION_ERROR NOT_FOUND ALREADY_EXISTS  RATE_LIMITED SPARK_LIMIT_REACHED GLIMPS_LIMIT_REACHED LAYER_INSUFFICIENT  MEDIA_INVALID MEDIA_TOO_LARGE  SERVER_ERROR 

---

# Rate Limiting

txt id="6l0y7s" Auth endpoints: 10 requests / 15 minutes / IP  General API: 100 requests / minute / user  Media uploads: 10 uploads / hour / user  Discovery: 20 requests / hour / user 

---

# AUTH

---

# POST /auth/register

Register with email/password.

## Auth

None

## Request

json id="xj9t0n" {   "email": "user@example.com",   "password": "minimum8chars" } 

## Response

json id="5vwf8o" {   "success": true,   "data": {     "access_token": "jwt",     "refresh_token": "jwt",     "user": {       "id": "uuid",       "email": "user@example.com",       "onboarding_complete": false     }   } } 

## Rules

- Email normalized to lowercase
- Password minimum 8 chars
- bcrypt minimum 12 rounds
- Email uniqueness enforced server-side

---

# POST /auth/login

Login using email/password.

## Request

json id="3vb7jq" {   "email": "user@example.com",   "password": "password" } 

## Response

Same as /auth/register

---

# POST /auth/apple

Apple Sign In.

## Request

json id="ph3f5y" {   "identity_token": "apple_token" } 

## Rules

- Apple token verified server-side
- Existing account linked automatically if email matches

---

# POST /auth/google

Google Sign In.

## Request

json id="1zj60v" {   "id_token": "google_token" } 

---

# POST /auth/refresh

Refresh expired access token.

## Request

json id="0k36ye" {   "refresh_token": "jwt" } 

## Response

json id="e9k6it" {   "success": true,   "data": {     "access_token": "jwt",     "refresh_token": "jwt"   } } 

## Rules

- Old refresh token revoked immediately
- Refresh token rotation mandatory
- Expired/revoked refresh token returns AUTH_INVALID

---

# POST /auth/logout

Logout current session.

## Auth

Required

## Request

json id="xh8r2s" {   "refresh_token": "jwt" } 

## Response

json id="u0kwr3" {   "success": true,   "data": null } 

---

# USERS

---

# GET /users/me

Get current authenticated user.

## Auth

Required

## Response

json id="10r5ow" {   "success": true,   "data": {     "id": "uuid",     "email": "user@example.com",     "subscription_tier": "free",     "onboarding_complete": true,      "profile": {       "display_name": "Kyrre",       "city": "Kirkenes",       "reflection": "I've been thinking a lot about...",       "connection_type": "slow_dating",       "values": [         "calmness",         "creativity"       ]     },      "glimps": []   } } 

---

# POST /users/profile

Complete onboarding profile.

## Auth

Required

## Request

json id="q97gva" {   "display_name": "Kyrre",   "birth_year": 1990,   "gender": "man",   "seeking": ["woman"],   "city": "Kirkenes",   "country": "Norway",   "latitude": 69.7271,   "longitude": 30.0454,    "reflection": "I've been thinking a lot about...",    "connection_type": "slow_dating",    "recharge_styles": [     "reading",     "nature"   ],    "values": [     "calmness",     "deep_conversations"   ] } 

## Rules

- Coordinates stored server-side only
- Profile incomplete until minimum one Glimps exists
- Validation enforced with Zod

---

# PUT /users/profile

Update profile fields.

## Auth

Required

## Rules

- Partial updates allowed
- Restricted fields validated individually

---

# DELETE /users/me

Soft delete account.

## Auth

Required

## Rules

- Immediately revokes sessions
- User hidden from discovery immediately
- Hard delete performed after retention period

---

# GLIMPS

---

# GET /glimps

Get current user Glimps.

## Auth

Required

---

# POST /glimps

Create Glimps.

## Auth

Required

## Request

multipart/form-data

txt id="uk0c0w" media_file     required text_overlay   optional audio_file     optional audio_label    optional sort_order     optional 

## Rules

txt id="1z4l92" Max active Glimps: 3 Video max length: 30 seconds Audio max length: 30 seconds 

## Errors

txt id="g5jlwm" GLIMPS_LIMIT_REACHED MEDIA_INVALID MEDIA_TOO_LARGE 

---

# DELETE /glimps/:id

Delete Glimps.

## Auth

Required

## Rules

- Ownership validated server-side
- Soft delete media relationship first

---

# DISCOVERY

---

# GET /discovery/today

Get curated daily discovery.

## Auth

Required

## Response

json id="g2u0oi" {   "success": true,   "data": {     "people": [       {         "discovery_id": "uuid",          "glimps": [           {             "id": "uuid",             "media_type": "photo",             "media_url": "https://...",             "text_overlay": "Some days the quiet says it all."           }         ],          "energy": {           "values": [             "calmness",             "creativity"           ],            "recharge_styles": [             "reading",             "nature"           ]         }       }     ],      "sparks_remaining_today": 1   } } 

## Critical Privacy Rules

txt id="br0e5j" NO: - user_id - display_name - exact age - coordinates - direct identity  ONLY: - discovery_id - Glimps - energy/personality metadata 

---

# SPARKS

---

# POST /sparks

Send Spark.

## Auth

Required

## Request

json id="15y2ib" {   "discovery_id": "uuid" } 

## Response

json id="fn64zr" {   "success": true,   "data": {     "spark_id": "uuid",     "matched": false,     "sparks_remaining_today": 0   } } 

## Rules

- Daily limits enforced server-side
- Duplicate sparks prevented
- Discovery ID resolved internally to real user ID

---

# GET /sparks/incoming

Get incoming Sparks.

## Auth

Required

## Response

Identity still hidden.

json id="jz4wjv" {   "success": true,   "data": {     "sparks": [       {         "spark_id": "uuid",         "glimps": [],         "energy": {},         "created_at": "2026-05-14T10:00:00Z"       }     ]   } } 

---

# POST /sparks/:spark_id/return

Return Spark and create Connection.

## Auth

Required

## Response

json id="p5dhnx" {   "success": true,   "data": {     "connection": {       "id": "uuid",       "current_layer": 1,        "partner": {         "display_name": "Sofia",         "age_range": "late 20s",         "city": "Tromsø",          "glimps": [],          "values": [           "calmness",           "creativity"         ]       }     }   } } 

## Rules

Layer 1 information unlocked:

txt id="18e7m2" - display_name - age_range - city - avatar (blurred) - values - Glimps 

---

# POST /sparks/:spark_id/pass

Dismiss incoming Spark.

## Auth

Required

---

# CONNECTIONS

---

# GET /connections

Get active Connections.

## Auth

Required

## Response

json id="j5psur" {   "success": true,   "data": {     "connections": [       {         "id": "uuid",          "current_layer": 2,          "window_active": false,          "partner": {           "display_name": "Sofia",            "avatar_url": "https://...",            "avatar_blur_level": 0.5         },          "last_message": {           "content": "I love how you think about this."         },          "unread_count": 0       }     ]   } } 

---

# GET /connections/:id

Get single Connection.

## Auth

Required

## Rules

Layer-gated response.

Server calculates:

txt id="z70w0t" - current layer - visible fields - avatar blur level - pulse visibility - Window availability 

Client never decides permissions.

---

# GET /connections/:id/messages

Get paginated messages.

## Query Params

txt id="zydrud" limit before 

## Rules

- Cursor pagination preferred
- Ownership validated server-side

---

# POST /connections/:id/messages

Send message.

## Auth

Required

## Request

json id="3x6u1l" {   "content": "That sounds beautiful." } 

## Rules

- Connection membership verified
- Layer recalculation triggered after save

---

# POST /connections/:id/window

Opt into Window.

## Auth

Required

## Rules

txt id="8n5jlr" Window becomes active only when: - both users opt in - Layer 4 unlocked 

---

# GET /connections/:id/layer

Get progression state.

## Response

json id="9d63q6" {   "success": true,   "data": {     "current_layer": 2,      "progress": {       "message_count": 34,       "my_active_days": 5,       "partner_active_days": 4     },      "next_layer_at": {       "message_count": 60,       "active_days": 7     }   } } 

---

# PULSE

---

# GET /pulse/today

Get today's Pulse question.

## Auth

Required

---

# POST /pulse/answer

Submit Pulse answer.

## Auth

Required

## Request

json id="pmyuz9" {   "question_id": "uuid",   "answer": "A walk in the rain." } 

## Rules

- One answer per day
- Layer recalculation triggered after submission

---

# GET /pulse/history/:connection_id

Get shared Pulse history.

## Auth

Required

## Rules

txt id="6vjlwm" Requires Layer 3+ 

---

# MEDIA

---

# POST /media/upload

Upload media.

## Auth

Required

## Request

multipart/form-data

txt id="ymvffw" file context 

## Limits

txt id="xix9zm" Images: 10MB max  Videos: 50MB max 30 seconds max  Audio: 5MB max 30 seconds max 

## Response

json id="qm9zcb" {   "success": true,   "data": {     "media_id": "uuid",     "url": "signed_url",     "file_type": "image"   } } 

---

# SOCKET.IO EVENTS

Used for:

- chat
- typing
- layer unlocks
- Window activation
- Snuggle

---

# Socket Authentication

javascript id="z98c8m" socket.auth = {   token: 'Bearer jwt' } 

---

# Chat Events

## Client → Server

txt id="3p0b2q" message:send message:read typing:start typing:stop 

## Server → Client

txt id="zq5ryz" message:received message:read_confirmed typing:started typing:stopped layer:unlocked connection:window_activated 

---

# Snuggle Events

## Client → Server

txt id="r0u4o7" snuggle:hold snuggle:release 

## Server → Client

txt id="d6sg5n" snuggle:partner_holding snuggle:partner_released snuggle:both_holding 

## Rules

txt id="38t5io" Requires: - Layer 4 - Window active  No persistence. No scores. No streaks. Pure real-time presence. 

---

# Security Requirements

txt id="2g5s5o" - All inputs validated with Zod - Parameterized SQL queries only - Signed media URLs only - Server-side Layer checks - Rate limiting on all endpoints - Auth middleware on protected routes - Request ownership validated everywhere - No raw location exposure - No token logging 

---

# Future API Extensions

Planned future endpoints:

txt id="9sgzwk" - reporting/blocking - push notifications - subscription management - profile export - moderation tooling - date planning tools - memory timelines - AI-assisted safety systems 

---

# Architectural Notes

The API intentionally prioritizes:

txt id="qagxma" - emotional pacing - privacy-first discovery - gradual identity reveal - server authority - anti-gamification - calm interaction design 

---

Document version: 1.1
