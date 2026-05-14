# Lingr — AI_GUIDE.md

Read this file before writing any code for Lingr.

---

# What Is Lingr?

Lingr is a slow dating app built around one idea:

> Some people are worth taking time with.

Lingr is intentionally designed as the opposite of swipe culture.

Users do not receive endless profiles.
They receive a small number of emotionally compatible people each day.

The app prioritizes:

- presence
- emotional pacing
- reflection
- gradual discovery
- intentional interaction

The goal is not maximum screen time.
The goal is meaningful connection.

---

# Core Concepts

Every developer working on Lingr must understand these concepts before writing code.

---

# Glimps

A Glimps is a unified emotional moment.

It combines:

- atmospheric media
- reflection text
- optional audio

A Glimps is NOT:

- a profile selfie
- an influencer post
- a social media story

A good Glimps feels like:

txt id="syg30v" - rain against a window - coffee at night - a thought during a walk - a quiet room - music and atmosphere 

Glimps are about emotional presence first.
Identity second.

---

# Spark

A Spark is an intentional expression of interest.

Unlike a swipe:

- it is limited
- it is blind
- it is meaningful

The sender does not know whether the other person will respond.

The receiver sees:

- Glimps
- emotional energy
- reflection

But NOT identity.

Mutual Sparks create a Connection.

---

# Connection

A Connection is created when two people Spark each other.

Connections unlock:

- chat
- Layers
- Pulse sharing
- Window
- Snuggle

Connections should feel calm and focused.
Not disposable.

---

# Layers

Lingr profiles open gradually.

Not everything is visible immediately.

Layers are earned through:

- conversation
- time
- reciprocity
- presence

NOT through:

- payment
- streaks
- activity spam

---

# Window

Window is a mutually chosen deeper space.

When both users opt in:

- discovery becomes quieter
- Layers fully open
- the connection becomes more intentional

Window should feel emotionally important.
Never gamified.

---

# Pulse

Pulse is a daily reflection system.

Examples:

txt id="i7u6vv" What made you feel calm today? What stayed with you today? What felt meaningful today? 

Pulse is NOT:

- engagement bait
- quizzes
- compatibility scoring

Pulse exists to create gradual emotional familiarity.

---

# Snuggle

Snuggle is real-time co-presence.

Two people hold a button simultaneously.

That is all.

No points.
No streaks.
No rewards.

It should feel:

- quiet
- intimate
- simple
- emotionally safe

---

# What Lingr Is NOT

Lingr is NOT:

txt id="g26kvz" - Tinder - Bumble - a social media feed - a marketplace - gamified dating - optimized for addiction 

Avoid features that create:

- compulsive refreshing
- vanity metrics
- dopamine loops
- popularity hierarchies

---

# Product Philosophy

Every feature should support:

txt id="ebd2aj" - slowness - emotional safety - intentionality - curiosity - calmness - presence 

Before adding anything ask:

> Does this deepen presence,
> or increase noise?

If it increases noise:
do not build it.

---

# Monorepo Structure

txt id="gkfr4v" lingr/ ├── apps/ │   ├── mobile/ │   └── api/ ├── packages/ │   └── shared/ ├── docs/ └── package.json 

---

# Tech Stack

---

# Mobile

txt id="cyiqo2" React Native (Expo) Expo Router Zustand Axios Socket.io-client React Native Reanimated expo-image expo-av expo-secure-store 

---

# Backend

txt id="jkbm4q" Node.js Express TypeScript (strict mode) PostgreSQL Socket.io Zod JWT bcrypt Multer node-cron 

---

# Infrastructure

txt id="4n5p4r" PostgreSQL Local/S3-compatible media storage Cloudflare Tunnel Signed media URLs 

---

# Architecture Rules

These rules are NOT optional.

---

# 1. Business Logic Lives In Services

Controllers should:

txt id="pb5yji" - validate input - call services - return responses 

Services contain:

txt id="26d6j7" - business logic - workflows - permission logic - orchestration 

Repositories contain:

txt id="7n4scx" - SQL queries only 

Never query PostgreSQL directly inside controllers.

---

# 2. Layer Checks Are Always Server-Side

The client never decides:

- current layer
- unlocked fields
- permissions

Every sensitive response must validate Layer access server-side.

---

# 3. Discovery Never Exposes Real User IDs

Discovery responses return:

txt id="yk97r9" discovery_id 

NOT:

txt id="9gmfkr" user_id 

Real identity only appears after mutual Spark.

---

# 4. All Input Must Use Zod Validation

Every route must validate input BEFORE processing.

Never trust:

- req.body
- req.query
- multipart fields

Without schema validation.

---

# 5. All Queries Must Be Parameterized

Never interpolate user input into SQL strings.

Always use:

sql id="c0hj6c" WHERE id = $1 

Never:

sql id="q0d7dl" WHERE id = '${userInput}' 

---

# 6. Media URLs Must Be Signed

Media files are never permanently public.

Generate signed temporary URLs dynamically.

Default expiry:

txt id="tgbnfx" 1 hour 

---

# 7. Raw Coordinates Must Never Reach Clients

Latitude/longitude are server-only.

Clients may receive:

txt id="g0r1i6" - city - region - approximate distance 

Never exact coordinates.

---

# Coding Conventions

---

# TypeScript

Rules:

txt id="85rynl" - strict mode enabled - no any - async/await preferred - small functions - single responsibility 

---

# Naming

txt id="2t4kdr" Files: kebab-case  Components: PascalCase  Functions: camelCase  Constants: SCREAMING_SNAKE_CASE  DB tables: snake_case  DB columns: snake_case 

---

# Comments

Comment WHY.
Not WHAT.

Bad:

ts id="d0xjqa" // increment count count++ 

Good:

ts id="1ggdga" // Layer progression depends on meaningful reciprocity, // not message bursts from one user. 

---

# Security Rules

---

# Authentication

txt id="b7yx3h" Access tokens: 15 minutes  Refresh tokens: 30 days  Refresh tokens: hashed in DB  Refresh token rotation: required 

---

# Passwords

txt id="6od7dr" bcrypt minimum 12 rounds minimum password length: 8 never log passwords never return password_hash 

---

# Authorization

Every protected resource must verify ownership.

Examples:

txt id="3xv7l0" - message belongs to connection - connection belongs to user - Glimps belongs to user - Pulse history belongs to connection 

---

# Rate Limiting

txt id="a3mjlwm" Auth: 10 / 15min / IP  General API: 100 / minute / user  Media: 10 / hour / user  Discovery: 20 / hour / user 

---

# GDPR & Privacy

Lingr handles sensitive emotional and relational data.

Privacy is a core product feature.

---

# Data Minimization

Collect only what is necessary.

Avoid:

txt id="n4iq1r" - unnecessary analytics - invasive tracking - behavioral surveillance 

---

# Account Deletion

Deletion flow:

txt id="sz0dh1" 1. soft delete immediately 2. remove from discovery 3. revoke sessions 4. anonymize sensitive content 5. hard delete after retention period 

---

# Sensitive Data

These fields require extra care:

txt id="6n0wcv" - gender - seeking - Pulse answers - location - relationship intentions 

Never expose prematurely.

---

# React Native Rules

---

# Expo Managed Workflow Only

Do not eject unless absolutely necessary.

---

# Storage

Sensitive tokens must use:

txt id="2r6nhi" expo-secure-store 

NOT:

txt id="8hgr3m" AsyncStorage 

---

# Media

Use:

txt id="r5mzt9" expo-image expo-av expo-image-picker 

---

# Animation

Use:

txt id="rw1udf" react-native-reanimated 

Avoid legacy Animated API.

---

# State Management

Use Zustand for global state.

Keep:

- UI state local
- business state centralized

---

# Design Philosophy

Lingr should feel like:

txt id="8o9ws4" - a quiet journal - a slow morning - warm paper - thoughtful conversation 

NOT:

txt id="7q8r0r" - a casino - a social feed - a game - a dopamine machine 

---

# Design Tokens

ts id="k8j7kl" export const colors = {   bgDark: '#1C2B25',   bgLight: '#F5EDE4',   accent: '#D4896A',   accentLight: '#E8B89A',   textDark: '#1C2B25',   textMuted: '#8A8A8A', } 

---

# Layer System Notes

Layer progression is calculated ONLY in:

txt id="vlkn0m" LayerService.calculateLayer() 

Never calculate Layers client-side.

This function:

txt id="b72t9s" 1. loads layer_progress 2. evaluates thresholds 3. updates current_layer 4. emits socket events 5. returns new layer 

Triggered after:

txt id="8axtx7" - messages - Pulse answers - Window opt-ins 

Never manually manipulated by clients.

---

# Discovery Philosophy

Discovery is intentionally limited.

Free users:

txt id="ys0dsp" 1 person/day 

Paid users:

txt id="9swwjo" 3–5 people/day 

The goal is:

txt id="m6huxc" attention quality 

NOT:

txt id="pbtvlq" engagement quantity 

---

# What Good Code Looks Like

Good Lingr code is:

txt id="s6z3ll" - calm - simple - modular - privacy-aware - emotionally intentional - easy to reason about 

Bad Lingr code is:

txt id="hig25z" - clever but confusing - overly abstract - engagement-optimized - difficult to audit 

---

# Before Every Coding Session

Ask yourself:

txt id="l38c83" - Does this support emotional pacing? - Does this protect privacy? - Is the server authoritative? - Is this modular? - Is this calm? - Would this feel human? 

If not:
rethink the implementation.

---

# Final Principle

Lingr should help people slow down enough
to actually notice each other.

Every line of code should support that.

---

Document version: 1.1
