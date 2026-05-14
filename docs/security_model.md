# Lingr — Security Model

Security architecture, privacy rules and trust boundaries for Lingr.

---

# Purpose

Lingr handles emotionally sensitive personal data.

Security is not just infrastructure.

It is part of the emotional trust users place in the product.

The security model exists to protect:

txt id="q7f8o1" - identity - emotional vulnerability - relational privacy - location safety - intentional pacing 

The system should feel:

txt id="u2d9m3" safe by design 

Not:

txt id="g4v8p0" secure only as an afterthought 

---

# Core Security Philosophy

Lingr follows these principles:

txt id="k3m7t9" - minimum necessary exposure - server-side authority - progressive disclosure - privacy-first defaults - defense in depth 

The app intentionally exposes LESS information than typical dating apps.

---

# Trust Boundaries

---

# The Client Is Never Trusted

The mobile app is considered:

txt id="n8w5d4" an untrusted environment 

Clients may be:

txt id="e7u0p2" - modified - reverse engineered - intercepted - automated 

Therefore:

txt id="z1k4s6" all critical logic happens server-side 

---

# Server Authority

The backend is authoritative for:

txt id="y5d2v8" - authentication - layer progression - permissions - discovery generation - Spark limits - Window activation - profile visibility 

Clients never decide:

txt id="h8m6o3" - current Layer - unlocked profile fields - discovery eligibility 

---

# Authentication Security

---

# Access Tokens

Access tokens:

txt id="v4f0x1" - JWT-based - short-lived - 15 minute expiry 

Used for:

txt id="b7q2y5" authenticated API access 

---

# Refresh Tokens

Refresh tokens:

txt id="r6p9m4" - 30 day expiry - rotated on every refresh - stored hashed in database 

Never store plaintext refresh tokens.

---

# Secure Storage

Mobile token storage uses:

txt id="o3n5w8" expo-secure-store 

Never:

txt id="w2m9c7" AsyncStorage 

Reason:

txt id="a7f1z3" AsyncStorage is not secure enough for long-lived credentials 

---

# Token Rotation

Every refresh operation:

txt id="x8v2k6" 1. validates old refresh token 2. revokes old token 3. issues new refresh token 4. issues new access token 

Purpose:

txt id="g9m1s4" reduce replay attack window 

---

# Password Security

Passwords:

txt id="c5p8n2" - minimum 8 characters - hashed with bcrypt - minimum 12 rounds 

Never:

txt id="q4z7w1" - log passwords - return hashes - expose auth internals 

---

# OAuth Security

Supported providers:

txt id="n1v8m5" - Apple - Google 

OAuth verification happens server-side only.

Identity tokens are verified against:

txt id="t9d2q6" provider public keys 

Never trusted directly from client.

---

# Authorization Model

---

# Resource Ownership

Every protected request verifies ownership.

Examples:

txt id="f8w3m1" - user belongs to connection - user owns Glimps - user owns media file - user may access Pulse history 

---

# Connection Access

Connections are accessible ONLY if:

txt id="j5r0n9" requesting user is user_a or user_b 

All connection queries enforce this server-side.

---

# Layer Authorization

Layer permissions enforced server-side on every request.

Clients NEVER decide visibility.

Example:

txt id="e4k8s7" Layer 1: city visible  Layer 3: Pulse history visible  Layer 4: Snuggle allowed 

All checks happen before response generation.

---

# Discovery Privacy

Discovery intentionally hides identity.

Discovery responses NEVER include:

txt id="z2x1c4" - user_id - exact age - exact location - clear avatar 

Instead:

txt id="p8q4m6" temporary discovery_id 

Is used internally.

---

# Discovery ID Protection

Purpose:

txt id="o1r9d5" prevent user enumeration attacks 

Discovery IDs:

txt id="k6u7t0" - temporary - non-sequential - server-resolved only 

Clients never receive actual user IDs before mutual Spark.

---

# Location Security

---

# Coordinate Protection

Latitude and longitude:

txt id="s5x9p3" never exposed to clients 

Location calculations happen server-side only.

---

# Visible Location Rules

Location visibility:

txt id="v0m3k7" Discovery: hidden  Layer 1: city only  Higher layers: optional broader context 

Never:

txt id="d4q8n2" exact coordinates 

---

# Distance Matching

Distance calculations use:

txt id="h7w5c9" server-side geospatial queries 

Clients never calculate proximity.

---

# Media Security

---

# Signed URLs

Media files use:

txt id="r3m0f6" signed expiring URLs 

Default expiry:

txt id="k1t9v4" 1 hour 

Reason:

txt id="u6p7d8" prevent permanent uncontrolled media sharing 

---

# Media Storage

Media stored outside public web root when possible.

Files referenced via:

txt id="x4s2m5" generated signed access URLs 

Not:

txt id="g0n8q1" public permanent paths 

---

# Upload Validation

Uploads validated server-side for:

txt id="y9f6m3" - mime type - extension - file size - duration - upload context 

---

# Upload Limits

txt id="c8u4p7" Images: 10MB  Video: 50MB max 30 seconds  Audio: 5MB max 30 seconds 

---

# Content Sanitization

All text inputs sanitized against:

txt id="q7n5d1" - XSS - script injection - malformed payloads 

Even React Native clients are not trusted.

---

# Database Security

---

# Parameterized Queries

All queries use:

sql id="b1k9u5" WHERE id = $1 

Never string interpolation.

Purpose:

txt id="v2q8d4" prevent SQL injection 

---

# Principle of Least Access

Database credentials should only have:

txt id="h5r0p9" required permissions 

Avoid:

txt id="s8n1m3" superuser application roles 

---

# Migration Discipline

Schema changes must be:

txt id="m4x7t6" - versioned - reproducible - committed 

Never:

txt id="z3d6w2" manual production edits 

---

# API Security

---

# HTTPS Only

Production APIs must use:

txt id="n7v4c1" HTTPS exclusively 

No plaintext HTTP.

---

# CORS Restrictions

CORS configured explicitly.

Never:

txt id="p2f9m8" Access-Control-Allow-Origin: * 

Allowed origins defined in environment configuration.

---

# Helmet Middleware

Express uses:

txt id="j6u3d5" helmet 

To enforce:

txt id="w8q1k0" - secure headers - clickjacking protection - MIME protections 

---

# Rate Limiting

---

# Limits

txt id="x5n0t9" Auth: 10 requests / 15 min / IP  General API: 100 requests / minute / user  Discovery: 20 requests / hour / user  Media: 10 uploads / hour / user 

Purpose:

txt id="m9w2f6" reduce abuse and automation 

---

# Abuse Prevention

Future anti-abuse systems may include:

txt id="d4x8r0" - behavioral anomaly detection - spam heuristics - duplicate account detection 

Excluded from V1 intentionally.

---

# Socket.io Security

---

# Socket Authentication

Socket connections require:

txt id="r0v4m7" valid JWT access token 

Invalid tokens rejected immediately.

---

# Socket Authorization

Server validates:

txt id="y2u7n5" connection ownership 

Before emitting:

txt id="v8k1d2" - messages - typing events - Snuggle events - layer unlocks 

---

# Snuggle Security

Snuggle events are:

txt id="m5p3x7" ephemeral only 

No persistence.

No replay history.

No analytics scoring.

---

# Logging Philosophy

---

# Sensitive Data Rules

Never log:

txt id="a6n2q9" - passwords - refresh tokens - raw coordinates - private Pulse answers - authentication secrets 

---

# Structured Logging

Production logging uses:

txt id="k4d9v1" pino 

Every request includes:

txt id="u0m7r5" request_id 

Purpose:

txt id="e3v8w6" traceability without leaking sensitive user information 

---

# GDPR Principles

Lingr is privacy-sensitive by design.

---

# Data Minimization

Only collect:

txt id="j7p4m0" what is necessary for the product to function 

Avoid excessive behavioral analytics.

---

# Account Deletion

Deletion flow:

txt id="v2f8n1" 1. soft delete immediately 2. remove from discovery 3. revoke sessions 4. anonymize messages 5. hard delete after retention period 

---

# Retention Policies

txt id="d0k5x4" Deleted accounts: 30 days  Expired refresh tokens: 7 days  Old discovery records: 90 days  Passed sparks: 60 days 

---

# Emotional Safety Philosophy

Lingr security is not only technical.

It is psychological.

Users should feel:

txt id="w1r6p9" - protected - respected - unexposed - emotionally safe 

The system intentionally slows identity exposure.

Because emotional vulnerability deserves pacing.

---

# Future Security Expansion

Potential future additions:

txt id="h9m4t3" - device reputation - suspicious activity scoring - encrypted media storage - optional disappearing messages - exportable privacy audit logs 

Not included in V1 intentionally.

---

# Final Philosophy

Lingr is built on trust.

Every security decision should support:

txt id="u8v1m5" human emotional safety 

Not merely:

txt id="z5k0n7" technical compliance 

The safest system is often:

txt id="b2r9x4" the one that exposes less in the first place 

---

Document version: 1.0
Status: Ready for implementation
