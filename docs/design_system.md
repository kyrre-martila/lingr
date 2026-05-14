# Lingr — Design System

Visual language, emotional UX principles and interface rules for Lingr.

---

# Purpose

The Lingr design system exists to create emotional consistency across the entire product.

Every screen should feel:

- calm
- intentional
- warm
- emotionally safe
- spacious

Lingr should never feel:

- loud
- addictive
- hyper-optimized
- gamified
- overstimulating

The interface should feel closer to:

txt id="d0u7ya" a thoughtful journal 

Than:

txt id="6eqx4p" a social media platform 

---

# Core Design Philosophy

Lingr is designed around:

txt id="rv3m2o" presence over performance 

The UI should encourage:

txt id="v8u4wa" - slowing down - noticing - reflecting - emotional curiosity 

Not:

txt id="r5tm4l" - endless interaction - compulsive behavior - dopamine loops 

---

# Emotional Design Principles

---

# Calmness

Interfaces should breathe.

Use:

txt id="q2s4hu" - generous spacing - soft transitions - minimal clutter - restrained motion 

Avoid:

txt id="b6u0hw" - crowded layouts - excessive badges - notification overload - flashing states 

---

# Warmth

Lingr should feel human.

Visual tone should resemble:

txt id="0z0e8y" - warm paper - candlelight - quiet mornings - soft textures 

Avoid:

txt id="h0x4oy" - cold corporate minimalism - harsh neon palettes - ultra-tech aesthetics 

---

# Intentionality

Every UI element should justify its existence.

Questions to ask:

txt id="n3q5j8" - Does this reduce noise? - Does this support emotional pacing? - Does this help users feel safer? 

If not:

txt id="m2b9q7" remove it 

---

# Visual Identity

---

# Brand Tone

Lingr should visually communicate:

txt id="z8v4t3" - softness - depth - emotional maturity - intimacy - reflection 

Not:

txt id="3q3e6x" - hype - speed - youth obsession - competitive desirability 

---

# Color Palette

Primary colors:

ts id="z9b2c6" export const colors = {   bgDark: '#1C2B25',   bgLight: '#F5EDE4',   bgMuted: '#6B7B6E',   bgMauve: '#7D6B72',    accent: '#D4896A',   accentLight: '#E8B89A',    textDark: '#1C2B25',   textLight: '#F5EDE4',   textMuted: '#8A8A8A',    cardBg: '#FFFFFF',   tabBar: '#1C2B25', } 

---

# Color Philosophy

---

# Background Colors

Primary app background:

txt id="jq1r4z" #F5EDE4 

Purpose:

txt id="d2r7yb" warm emotional softness 

Should feel:

txt id="x2m7dy" paper-like 

Not sterile white.

---

# Accent Color

Primary accent:

txt id="o4h2qp" #D4896A 

Used for:

txt id="s7v5dy" - intentional actions - active states - emotional warmth 

Avoid overuse.

Accent should feel:

txt id="m9y3ow" special and calm 

Not aggressive.

---

# Dark Surfaces

Dark tone:

txt id="v8f1m0" #1C2B25 

Used for:

txt id="u3m5k6" - tab bars - grounding surfaces - emotional contrast 

Should feel:

txt id="n7z1x2" earthy and deep 

Not cyberpunk black.

---

# Typography

---

# Primary Fonts

txt id="h5v3p1" Display: Cormorant Garamond  Body: DM Sans 

---

# Typography Philosophy

Display typography should feel:

txt id="s1r9g8" - literary - reflective - human 

Body typography should feel:

txt id="e2x8w7" - clear - soft - modern - readable 

Avoid:

txt id="f6n2z9" - overly futuristic fonts - hyper-geometric styles - sharp aggressive typography 

---

# Spacing System

ts id="r9y5d3" export const spacing = {   screenPadding: 24,   cardRadius: 16,   buttonRadius: 50,   sectionGap: 32, } 

---

# Spacing Philosophy

Whitespace is emotionally important.

Lingr should never feel cramped.

Spacing should communicate:

txt id="v5g0z2" there is time here 

---

# Motion Design

---

# Animation Principles

Allowed:

txt id="m1d6k9" - fade - blur - soft scale - slow slide - subtle parallax 

Avoid:

txt id="g4q2m0" - bounce - confetti - aggressive spring animations - flashy transitions 

Motion should feel:

txt id="o7w4r1" gentle and atmospheric 

Not:

txt id="b9x6v2" reward-driven 

---

# Animation Timing

Preferred timing:

txt id="v3z7j5" 250ms–500ms 

Longer than most modern social apps intentionally.

Reason:

txt id="e0m1u7" slows interaction rhythm slightly 

---

# Components

---

# Buttons

Buttons should feel:

txt id="y2v7d4" soft and intentional 

Preferred style:

txt id="g1u9w0" - rounded pill shapes - minimal borders - warm fills 

Avoid:

txt id="n5r2e8" - harsh shadows - glossy effects - sharp corners 

---

# Cards

Cards are central to Lingr.

Examples:

txt id="m7x3k4" - Glimps - Connection previews - Pulse history 

Cards should feel:

txt id="d6p8t1" personal and tactile 

Not:

txt id="r3g0v5" dashboard-like 

---

# Glimps Card Philosophy

A Glimps is ONE emotional unit.

Not:

txt id="j8u1m3" stacked disconnected widgets 

A Glimps combines:

txt id="w4k7x0" - image/video - text overlay - optional audio 

As one atmospheric experience.

---

# Tab Bar

Tab bar should feel:

txt id="u8t5v6" quiet and grounding 

Avoid:

txt id="v0m7s8" bright active indicators 

Icons should feel:

txt id="d4q9e2" handmade and soft 

Not:

txt id="x6w1k5" corporate system icons 

---

# Icons

Preferred icon style:

txt id="n3y5z8" - minimal - rounded - hand-drawn influence - slightly imperfect 

Avoid:

txt id="m0j8c7" - sharp line icons - hyper-technical iconography 

---

# Imagery Philosophy

---

# Photos

Lingr imagery should focus on:

txt id="j2d5t8" - atmosphere - objects - environments - moments 

Not primarily faces.

Examples:

txt id="e7x4u1" - rainy windows - coffee cups - train rides - forests - books - candlelight 

Reason:

txt id="t5m8v0" creates emotional curiosity before appearance judgment 

---

# Avatar Reveal

Clear profile photos should emerge gradually through Layers.

Blur progression:

txt id="g1q4v7" Layer 1 → heavily blurred Layer 2 → partially blurred Layer 3 → mostly visible Layer 4 → fully visible 

Blur should feel:

txt id="k9u2m6" cinematic and soft 

Not:

txt id="q8p5n1" pixelated or comedic 

---

# Sound Design

Sound should be:

txt id="v4z1d9" minimal and optional 

Avoid:

txt id="m3x8r0" - reward sounds - streak sounds - addictive notification tones 

If sounds exist:

txt id="w5t6p3" they should feel organic and quiet 

---

# Notification Design

Notifications should never create panic or urgency.

Bad:

txt id="h6v9y2" “You have 14 new matches!” 

Good:

txt id="g7m4d0" “Someone noticed you today.” 

Tone matters deeply.

---

# UX Philosophy

---

# Discovery

Discovery should feel:

txt id="d8z2p5" limited and meaningful 

Not:

txt id="v2q7x6" endless and disposable 

---

# Chat

Chat should feel:

txt id="o4r9w1" quiet and intimate 

Avoid:

txt id="n0m6t8" gamified typing indicators message reactions overload social feed mechanics 

---

# Window

Window should feel emotionally distinct.

Visual changes may include:

txt id="x3t8d7" - softer lighting - reduced UI noise - calmer pacing 

Window should psychologically feel:

txt id="u7y5p9" focused and emotionally intentional 

---

# Snuggle

Snuggle should feel:

txt id="f1w8m2" simple quiet co-present 

Not:

txt id="m8v4q3" gimmicky or performative 

---

# Accessibility

Lingr must remain emotionally calm WITHOUT sacrificing accessibility.

Requirements:

txt id="j4k7u2" - WCAG-compliant contrast - scalable text - screen reader compatibility - reduced motion support 

---

# Reduced Motion Support

If reduced motion enabled:

txt id="u5x9m7" - disable parallax - reduce blur transitions - shorten animations 

Never force atmospheric effects.

---

# Anti-Gamification Rules

Lingr intentionally avoids:

txt id="r2t8v1" - streaks - XP systems - match percentages - popularity scores - engagement loops - endless badges 

The interface should never psychologically resemble:

txt id="o0p5k3" a casino 

---

# Final Philosophy

Lingr’s design system exists to support emotional pacing.

Every screen should quietly communicate:

txt id="w8d2m6" You do not need to rush here. 

The product should help people:

txt id="t6y4u1" notice each other more deeply 

Not:

txt id="z1x7q9" consume each other more efficiently 

---

Document version: 1.0
Status: Ready for implementation
