# Lingr — Discovery Algorithm

Defines how Lingr selects, filters and presents people in daily discovery.

---

# Purpose

Lingr discovery is intentionally small.

The goal is NOT:

txt id="c9k2pz" maximum engagement 

The goal is:

txt id="7g3kfw" intentional emotional attention 

Users should feel:

txt id="3h0jqp" “I want to actually notice this person.” 

Not:

txt id="f0m9sq" “I need to optimize my swipes.” 

---

# Core Philosophy

Most dating apps optimize for:

txt id="v8t7as" - volume - speed - instant attraction - endless browsing 

Lingr optimizes for:

txt id="u9d2wr" - pacing - emotional resonance - curiosity - sustainable attention 

Discovery should feel like:

txt id="3j6wca" opening a thoughtful morning newspaper 

Not:

txt id="y4p7lg" scrolling a marketplace feed 

---

# Daily Discovery Limits

Discovery is intentionally constrained.

Free tier:

txt id="9r5lym" 1 person per day 

Paid tier:

txt id="x3z8vw" 3–5 people per day 

These are hard server-side limits.

Reasoning:

txt id="n0v4ut" attention becomes more meaningful when limited 

---

# Discovery Generation

Discovery is NOT generated live on request.

Instead:

txt id="0x9mse" daily discovery is pre-generated nightly 

Background job:

txt id="u1m6yt" generateDiscovery.job.ts 

Table:

txt id="i3u2pk" daily_discovery 

Benefits:

txt id="0x4sah" - predictable pacing - lower API latency - easier experimentation - stronger privacy control 

---

# Matching Factors

Discovery matching combines multiple signals.

No single factor dominates completely.

---

# Geographic Distance

Location matters.

Lingr prioritizes:

txt id="9ptlf9" reasonable real-world possibility 

Matching considers:

txt id="0dvmj5" - city - region - configurable radius 

Raw coordinates are NEVER exposed.

Distance calculation happens server-side only.

---

# Values Overlap

Shared emotional values are important.

Examples:

txt id="c7yy1f" - Calmness - Creativity - Humor - Warmth - Stability - Deep conversations 

Higher overlap increases compatibility score.

But:

txt id="lw9ov9" perfect overlap is NOT required 

Too much similarity can feel artificial.

---

# Recharge Style Compatibility

Recharge styles influence pacing compatibility.

Examples:

txt id="9u1z2z" - reading - quiet mornings - long walks - social gatherings - exercise - music 

Goal:

txt id="xk2pqp" reduce emotional tempo mismatch 

---

# Connection Intention Compatibility

Discovery prioritizes compatible intentions.

Examples:

txt id="1v1e2f" - slow dating - long-term relationship - friendship first - open exploration 

Strong incompatibilities lower match priority.

Example:

txt id="l7o0kr" someone seeking deep long-term commitment vs someone wanting highly casual exploration 

---

# Discovery Diversity

The system intentionally avoids:

txt id="9sdy9i" showing “the same type” repeatedly 

Discovery should contain:

txt id="lyo8tl" variation in energy variation in atmosphere variation in personality 

Even when compatibility is high.

Reason:

txt id="yv9m1f" human attraction is not mathematically linear 

---

# Hard Exclusions

The following users are NEVER eligible:

txt id="qj1a4g" - existing connections - blocked users - passed users - deleted users - incomplete onboarding - users outside configured geography 

Also excluded:

txt id="4c0r8l" users already shown recently 

Cooldown:

txt id="m1m6di" minimum 30 days before re-showing 

---

# Discovery Freshness

Discovery should prioritize:

txt id="e8ndx2" emotionally active users 

Signals:

txt id="0p8b4o" - recent activity - recent Pulse participation - recent Glimps updates 

But NOT:

txt id="3xavme" spammy activity volume 

Activity quality matters more than frequency.

---

# Glimps Quality Rules

Discovery strongly depends on Glimps quality.

Users without at least one active Glimps:

txt id="clmb3y" cannot appear in discovery 

The system may later score:

txt id="x2h1s0" - originality - emotional clarity - atmosphere - effort 

But V1 avoids aggressive content scoring.

Reason:

txt id="d8zkvc" avoid creator-economy behavior 

---

# Identity Protection

Discovery intentionally hides identity.

Discovery responses NEVER include:

txt id="ft1ynz" - user_id - exact age - exact location - full profile - clear avatar 

Only:

txt id="qv7r2r" - Glimps - emotional energy - values - atmosphere 

Identity reveals gradually through Layers.

---

# Discovery Card Philosophy

A discovery card should feel like:

txt id="j4r0v4" a quiet emotional window 

Not:

txt id="lf73on" a résumé or sales profile 

Focus on:

txt id="t4w7xh" - atmosphere - pacing - emotional texture - reflection 

Not:

txt id="by1ph3" - status - optimization - metrics 

---

# Ranking Model

V1 ranking model:

txt id="o2j7z6" weighted compatibility scoring 

Example weighting:

txt id="s6nmji" 40% values overlap 25% recharge compatibility 20% geographic proximity 15% discovery freshness 

Weights intentionally simple initially.

Reason:

txt id="pj3jmu" complex algorithms become difficult to reason about safely 

---

# Anti-Optimization Philosophy

Users should NOT feel encouraged to:

txt id="yn2f1g" - hack the algorithm - optimize visibility - perform emotionally - manipulate engagement 

Therefore Lingr avoids:

txt id="v6v9ja" - profile scores - popularity metrics - “most liked” - match percentages 

---

# Emotional Safety Rules

Discovery intentionally avoids:

txt id="5wh2xy" - overwhelming volume - rapid rejection loops - infinite scrolling 

Because:

txt id="94tk1r" constant micro-rejection changes user behavior psychologically 

Lingr wants users to remain:

txt id="7zv5lt" open, calm and emotionally present 

---

# Repeat Exposure Philosophy

Seeing the same person again should be rare.

But not impossible.

Potential future feature:

txt id="qnkc08" “Paths crossing again” 

Used carefully and sparingly.

Not included in V1.

---

# Time-of-Day Philosophy

Discovery should feel:

txt id="0op1tz" slow and daily 

Not:

txt id="m14eqm" constant and addictive 

Recommended generation time:

txt id="uyv9jn" early morning local time 

Reason:

txt id="7h2xq0" creates calm daily rhythm 

---

# Notification Philosophy

Discovery notifications should NEVER say:

txt id="9wwk1l" “You have 12 new matches!” 

Instead:

txt id="x6eb4m" “A new person appeared in your day.” 

Tone matters deeply.

---

# Edge Cases

---

# Sparse Regions

If few users nearby:

txt id="h1p6n9" expand radius gradually 

Priority order:

txt id="70x6d4" 1. same city 2. nearby cities 3. regional expansion 4. national expansion 

But never:

txt id="xk8i5z" unlimited global feed 

---

# Over-Exposure Protection

Highly active users should NOT dominate discovery.

Soft balancing may later reduce overexposure.

Reason:

txt id="5fd1ij" Lingr should not create “elite profile” dynamics 

---

# New User Boost

New users may receive:

txt id="42g2c0" small temporary visibility boost 

Only enough to avoid empty early experience.

Not enough to distort ecosystem quality.

---

# Future Discovery Expansion

Potential future additions:

txt id="m4y1s5" - seasonal moods - pacing compatibility - emotional communication style - shared routines - quiet-mode matching 

Excluded from V1 intentionally.

---

# Technical Implementation

---

# Generation Flow

Nightly process:

txt id="9vw7r9" 1. load eligible users 2. apply hard exclusions 3. calculate compatibility scores 4. apply diversity balancing 5. generate final daily selections 6. store in daily_discovery table 

---

# Discovery API

Endpoint:

txt id="0ez3vx" GET /discovery/today 

Returns:

txt id="v4v2ja" - temporary discovery_id - Glimps - values - recharge styles 

Never returns:

txt id="5kt9rb" actual user identity 

---

# Discovery IDs

Discovery IDs are temporary abstraction IDs.

Purpose:

txt id="lh2u2r" prevent direct user enumeration 

Discovery IDs resolve internally server-side only.

---

# Final Philosophy

Lingr discovery exists to create:

txt id="9g5z3z" attention instead of consumption 

The system should help users:

txt id="lyq1kz" notice people more deeply 

Not:

txt id="vvwhx0" process people more efficiently 

---

Document version: 1.0
Status: Ready for implementation
