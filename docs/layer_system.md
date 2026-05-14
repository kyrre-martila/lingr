# Lingr — Layer System

Defines how relational depth, profile visibility and emotional progression work inside Lingr.

---

# Purpose

The Layer system exists to slow connection down intentionally.

Instead of exposing everything immediately, Lingr reveals people gradually through:

- conversation
- consistency
- emotional investment
- mutual presence

Layers are designed to create:

- curiosity
- emotional safety
- intentional pacing
- reduced judgment based on appearance alone

The system rewards:

txt id="n4v6pz" - attention - reciprocity - patience - emotional consistency 

Not:

txt id="2bq8ya" - popularity - activity spam - payment - aggressive engagement 

---

# Core Principle

A user should feel like they are slowly getting to know a real person.

Not consuming a complete profile instantly.

The experience should resemble:

txt id="v5a3tl" meeting someone gradually over time 

Not:

txt id="h9u2dc" scrolling through a catalog 

---

# Layer Overview

txt id="7u8rgn" Layer 1 → Atmosphere Layer 2 → Personality Layer 3 → Emotional Context Layer 4 → Intentional Depth (Window) 

Each Layer unlocks additional visibility and emotional intimacy.

---

# Layer Philosophy

---

# Layer 1 — Atmosphere

Purpose:

Create emotional curiosity before identity.

At Layer 1 users primarily experience:

txt id="v4g9eo" - Glimps - emotional tone - reflection - energy - pacing 

Visible at Layer 1:

txt id="c0c7gw" - display name - approximate age range - city - values - connection intention - Glimps - heavily blurred avatar 

NOT visible:

txt id="ptszdw" - clear photos - detailed personal history - deep compatibility - Pulse history 

Avatar blur level:

txt id="r7h33s" 0.8 

Goal:

txt id="fwnf1v" “Do I feel emotionally drawn toward this person?” 

Not:

txt id="74xq0e" “Are they hot enough?” 

---

# Layer 2 — Personality

Purpose:

Reveal more human texture and individuality.

Unlocked through:

txt id="vt9pyw" - consistent messaging - multiple active days - early Pulse participation 

Visible at Layer 2:

txt id="x5zq2u" - lighter avatar blur - interests - humor style - daily habits - personality notes - conversational rhythm 

Avatar blur level:

txt id="0fl44z" 0.5 

Goal:

txt id="1p9nlr" “Do I enjoy this person’s mind and energy?” 

---

# Layer 3 — Emotional Context

Purpose:

Reveal emotional patterns and inner life.

Unlocked through:

txt id="a4h44n" - sustained interaction - emotional consistency - repeated Pulse participation 

Visible at Layer 3:

txt id="03lbte" - mostly clear avatar - Pulse history - emotional preferences - life goals - communication style - love language 

Avatar blur level:

txt id="cjq68e" 0.2 

At this stage users should begin feeling:

txt id="mw8z95" “I understand this person more deeply.” 

Not just:

txt id="6pwx4f" “I know facts about them.” 

---

# Layer 4 — Intentional Depth

Purpose:

Create a focused relational space.

Layer 4 is not automatic.

It requires:

txt id="tuk32t" - Layer 3 thresholds reached - mutual Window opt-in 

Layer 4 activates:

txt id="7n6o4x" Window 

Visible at Layer 4:

txt id="cfz08s" - fully clear avatar - full emotional context - shared Pulse archive - Snuggle access - intentional connection space 

Avatar blur level:

txt id="kvhwnr" 0.0 

Goal:

txt id="glzw7q" “We are intentionally exploring this connection.” 

---

# Layer Thresholds

Initial thresholds:

txt id="2j8l9m" Layer 1 → 2 - 20 messages - 3 active days each - 1 Pulse answer each  Layer 2 → 3 - 60 messages - 7 active days each - 3 Pulse answers each  Layer 3 → 4 - 120 messages - 14 active days each - 5 Pulse answers each - mutual Window opt-in 

Thresholds are intentionally conservative.

Lingr values:

txt id="ewi0p8" slow accumulation 

Not rapid unlocking.

---

# Active Day Rules

An active day means:

txt id="0x2q87" - meaningful interaction occurred 

NOT merely:

txt id="0s5n8w" - app opened - profile viewed - passive scrolling 

Examples that count:

txt id="8g5b06" - sending messages - answering Pulse - interacting intentionally 

Examples that do NOT count:

txt id="v6p5z7" - background activity - passive reads only 

---

# Layer Calculation

Layers are always calculated server-side.

Never trusted from the client.

Primary calculation source:

txt id="2cjlwm" layer_progress table 

Calculation happens:

txt id="2q3hmu" - after every message - after every Pulse answer - after Window opt-in 

Service:

txt id="7b26pr" LayerService.calculateLayer(connectionId) 

---

# Layer Unlock Experience

When a Layer unlocks:

txt id="x3s0cw" - both users receive a quiet notification - subtle animation plays - newly unlocked elements fade in gradually 

Avoid:

txt id="7gnl1l" - confetti - achievement sounds - gamified celebration 

Unlocking should feel:

txt id="ghqk7s" gentle and meaningful 

Not:

txt id="8zj2gb" reward-machine dopamine 

---

# Avatar Blur Philosophy

Blur exists to:

- reduce immediate appearance judgment
- create curiosity gradually
- prioritize atmosphere first

Blur progression:

txt id="t4ib70" Layer 1 → 0.8 Layer 2 → 0.5 Layer 3 → 0.2 Layer 4 → 0.0 

Blur should feel:

txt id="b1lfim" soft and cinematic 

Not:

txt id="fsyuv6" pixelated or artificial 

---

# Pulse Visibility Rules

Pulse answers are hidden until Layer 3.

Reason:

txt id="fw4s6y" Pulse answers are emotionally intimate. 

Early sharing would encourage:

txt id="v8npz2" performance instead of authenticity 

At Layer 3:

txt id="5e6w6v" shared Pulse history becomes visible chronologically 

Presented as:

txt id="sx6xzr" a quiet emotional timeline 

Not:

txt id="gsd5q7" a statistics dashboard 

---

# Window Rules

Window is NOT simply “highest layer”.

It is:

txt id="jz2x5m" a mutual intentionality state 

Requirements:

txt id="r4qu9s" - both users must opt in manually - Layer 3 thresholds reached 

Effects of Window:

txt id="d7fq6l" - Layer 4 unlocked - Snuggle available - discovery deprioritized - emotional focus increased 

Window should psychologically feel like:

txt id="4l4mfj" “We are giving this connection room.” 

---

# Snuggle Rules

Snuggle is only available when:

txt id="fvvq3d" - Layer 4 active - Window active 

Snuggle is intentionally:

txt id="p1e88h" - ephemeral - private - non-performative 

No persistence.

No score.

No tracking.

No streaks.

---

# Anti-Gamification Rules

Layers must NEVER create:

txt id="kgv2ep" - grinding behavior - manipulation - artificial urgency - pressure loops 

Therefore:

txt id="z5x9bq" - no progress bars - no percentages - no “XP” - no countdown timers 

Allowed:

txt id="y5y83f" - soft indicators - gentle progress language - emotional framing 

Example:

txt id="kmm0o6" “You’re slowly getting to know each other.” 

NOT:

txt id="m7yx06" “87% complete until next unlock.” 

---

# Edge Cases

---

# Inactive Connections

If users stop interacting:

txt id="m4yzm9" - Layers do not decay immediately - Window may eventually become inactive 

Potential future behavior:

txt id="u0h3a0" soft fading of inactive emotional spaces 

Not included in V1.

---

# Blocking

If a user blocks another:

txt id="ujp60m" - connection soft deleted - messages hidden - Snuggle terminated immediately - users excluded permanently from discovery 

---

# Deleted Accounts

If one user deletes account:

txt id="v7mqon" - connection anonymized - messages preserved structurally - personal profile data removed 

---

# UX Principles

The Layer system should psychologically feel:

txt id="97h2ui" - calm - earned - emotionally safe - curiosity-driven 

Never:

txt id="4d4m3v" - addictive - manipulative - transactional 

---

# Technical Notes

---

# Server Authority

Layer visibility rules enforced:

txt id="zwl9in" - API layer - service layer - Socket.io events 

Never client-side only.

---

# Future Expandability

Possible future additions:

txt id="d8t9tl" - custom Layers - shared memory spaces - mutual rituals - slower pacing modes 

These are intentionally excluded from V1.

---

# Final Philosophy

The Layer system exists because real intimacy rarely happens instantly.

Lingr intentionally protects slowness.

The system is designed to help users:

txt id="2my1qa" notice each other gradually 

Instead of consuming each other immediately.

---

Document version: 1.0
Status: Ready for implementation
