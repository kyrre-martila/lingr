# Lingr — README

A slow dating app built around presence, reflection and intentional connection.

---

# What is Lingr?

Lingr is a slow dating app designed for people who are tired of swipe culture.

Instead of endless profiles, fast judgments and dopamine loops, Lingr focuses on a small number of intentional connections.

People are revealed gradually through conversation, reflection and mutual investment.

The goal is not maximum engagement.

The goal is meaningful connection.

---

# Core Philosophy

Most dating apps optimize for:

txt id="q1w2e3" - screen time - swipes - endless discovery - addictive behavior 

Lingr optimizes for:

txt id="a4s5d6" - presence - intentionality - emotional safety - slower connection - genuine curiosity 

Lingr believes:

txt id="f7g8h9" Some people are worth taking time with. 

---

# Core Concepts

---

# Glimps

A Glimps is a unified emotional moment.

Not a selfie.

Not a profile card.

A Glimps combines:

txt id="j1k2l3" - photo or short video - reflection text - optional audio or music 

Examples:

txt id="m4n5o6" - rain on a window - coffee at sunrise - a quiet room - a train ride - a thought - a memory 

Glimps are designed to communicate atmosphere and inner life before appearance.

---

# Spark

A Spark is an intentional expression of interest.

Unlike a swipe or like:

txt id="p7q8r9" - Sparks are limited - Sparks are blind - Sparks are quiet 

The receiver sees:

txt id="s1t2u3" “Someone noticed you today.” 

But they do NOT immediately see who.

Identity is intentionally delayed.

---

# Connection

A Connection forms when two people Spark each other mutually.

Once connected:

txt id="v4w5x6" - chat opens - Layers begin unlocking - deeper profile information becomes available 

Connections are meant to feel calm and spacious, not transactional.

---

# Layers

Lingr profiles reveal themselves gradually.

Not all at once.

Layers unlock through:

txt id="y7z8a9" - conversation - active days - Pulse participation - mutual investment 

Not through payment.

Early layers focus on:

txt id="b1c2d3" - energy - reflection - atmosphere - values 

Later layers reveal:

txt id="e4f5g6" - clearer photos - personal stories - deeper compatibility - emotional history 

---

# Pulse

Pulse is a daily reflective prompt.

Examples:

txt id="h7i8j9" “What made you feel calm today?” “What has been on your mind lately?” “What felt meaningful today?” 

Pulse is not a quiz.

It is meant to slowly accumulate emotional familiarity over time.

---

# Window

Window is a mutual deepening state.

Both users actively opt in.

When Window opens:

txt id="k1l2m3" - discovery slows down - focus increases - more Layers unlock - the connection becomes more intentional 

Window represents:

txt id="n4o5p6" “Let’s give this real attention.” 

---

# Snuggle

Snuggle is a lightweight real-time presence feature.

Both users hold a button simultaneously.

No points.

No streaks.

No score.

Just shared presence.

---

# Business Model

Lingr does NOT lock emotional depth behind payment.

Core relationship features are free.

Payment only affects:

txt id="q7r8s9" - discovery breadth - number of daily Sparks 

Free users:

txt id="t1u2v3" 1 person per day 

Paid users:

txt id="w4x5y6" 3–5 people per day 

The philosophy:

txt id="z7a8b9" Depth is always free. 

---

# Tech Stack

---

# Mobile

txt id="c1d2e3" - React Native - Expo - Expo Router - Zustand - Axios - Socket.io 

---

# Backend

txt id="f4g5h6" - Node.js - Express - PostgreSQL - TypeScript - Zod - Socket.io 

---

# Infrastructure

txt id="i7j8k9" - PostgreSQL - Cloudflare Tunnel - Local media storage - Signed expiring media URLs 

---

# Architecture Principles

---

# Privacy First

Lingr treats emotional and relational data as sensitive.

Rules include:

txt id="l1m2n3" - no raw location exposure - no permanent media URLs - no client-side layer trust - no user IDs in discovery 

---

# Server-Side Authority

All important logic happens server-side.

Including:

txt id="o4p5q6" - Layer progression - discovery generation - permission checks - Spark limits - Window activation 

---

# Calm UX

Lingr intentionally avoids:

txt id="r7s8t9" - streaks - badges - “top picks” - manipulative notifications - endless scrolling 

The UI should feel:

txt id="u1v2w3" - warm - spacious - quiet - premium - emotionally safe 

---

# Repository Structure

txt id="x4y5z6" lingr/ ├── apps/ │   ├── mobile/ │   └── api/ ├── packages/ │   └── shared/ ├── docs/ └── package.json 

---

# Development Status

Lingr is currently in:

txt id="a7b8c9" Pre-development architecture phase 

Current focus:

txt id="d1e2f3" - data model - API design - architecture - onboarding flow - Layer system - privacy rules 

---

# Development Philosophy

The architecture should reflect the product itself.

The codebase should feel:

txt id="g4h5i6" - intentional - understandable - calm - maintainable 

Not chaotic.

Not overengineered.

Not optimized for hype.

---

# Long-Term Vision

Lingr is not trying to become:

txt id="j7k8l9" - a social network - a creator platform - a content feed 

The long-term goal is simple:

txt id="m1n2o3" Help people build slower, healthier and more meaningful connections. 

If two people genuinely connect and leave the app together,
Lingr considers that a success.

---

# Internal Documentation

Project documentation lives in:

txt id="p4q5r6" docs/ 

Key documents:

txt id="s7t8u9" concept-summary.md data-model.md api-spec.md AI_GUIDE.md project-structure.md 

---

# Final Note

Lingr is built around a belief that many modern digital experiences move too fast.

The app is intentionally designed to create pauses.

Moments of reflection.

Moments of attention.

Moments where someone feels genuinely seen.

---

txt id="v1w2x3" Some people are worth taking time with. 

---

Status: Pre-development
Version: 1.0
