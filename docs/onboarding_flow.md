# Lingr — Onboarding Flow

Defines the complete onboarding experience from first app launch to discovery eligibility.

---

# Purpose

The onboarding flow exists to:

- introduce Lingr’s philosophy slowly
- establish emotional tone before profile setup
- collect enough information for meaningful discovery
- create intentionality before entering the ecosystem

The onboarding should feel:

- calm
- reflective
- spacious
- emotionally safe

It should NOT feel:

- rushed
- overly form-like
- hyper-optimized
- gamified

---

# Completion Requirements

A user is considered onboarding complete when:

txt - profile created - required profile fields completed - at least 1 active Glimps uploaded - location permission granted - onboarding promise screen acknowledged 

Only then:

txt users.onboarding_complete = true 

Users cannot appear in discovery before onboarding is complete.

---

# Onboarding Structure

txt 1. Splash 2. Welcome 3. Philosophy Intro 4. Values Selection 5. Recharge Style Selection 6. Connection Intention 7. Reflection Prompt 8. Glimps Creation 9. Discovery Explanation 10. Presence Promise 11. Notification Permissions 12. Location Permissions 13. Complete 

---

# Screen 1 — Splash

Route:

txt /(auth)/index.tsx 

Purpose:

- establish visual tone
- introduce brand atmosphere
- slow the user down immediately

UI:

txt - warm atmospheric background - Lingr logo centered - subtle fade animation - no buttons initially 

Duration:

txt 2–3 seconds 

Then transitions automatically to Welcome.

---

# Screen 2 — Welcome

Route:

txt /(auth)/welcome.tsx 

Primary text:

txt Some people are worth taking time with. 

Secondary text:

txt Lingr is built for slower, more intentional connection. 

Actions:

txt - Continue with Apple - Continue with Google - Continue with Email 

Notes:

- no “sign up fast”
- no swipe references
- no gamified language

---

# Screen 3 — Philosophy Intro

Purpose:

Introduce the core emotional model before profile creation.

Carousel slides:

txt 1. Glimps 2. Sparks 3. Layers 4. Presence 

Each slide contains:

txt - soft atmospheric visual - short reflective copy - minimal motion 

Example:

txt “You are more than a profile photo.” 

---

# Screen 4 — Values Selection

Route:

txt /(onboarding)/step-1-values.tsx 

Prompt:

txt What kinds of energy feel meaningful to you? 

Selection style:

txt soft pill buttons multi-select 

Examples:

txt - Calmness - Creativity - Humor - Curiosity - Stability - Deep conversations - Playfulness - Warmth - Adventure 

Rules:

txt minimum 3 selections maximum 8 selections 

Used later for discovery matching.

---

# Screen 5 — Recharge Styles

Route:

txt /(onboarding)/step-2-recharge.tsx 

Prompt:

txt How do you return to yourself? 

Examples:

txt - Reading - Nature - Quiet mornings - Music - Long walks - Cooking - Journaling - Art - Coffee shops - Exercise 

Rules:

txt minimum 2 selections maximum 6 selections 

Purpose:

Helps matching prioritize compatible pacing and lifestyles.

---

# Screen 6 — Connection Intention

Route:

txt /(onboarding)/step-3-connection.tsx 

Prompt:

txt What kind of connection are you open to? 

Options:

txt - Slow dating - Long-term relationship - Friendship first - Open to seeing where things go 

Rules:

txt single select required 

---

# Screen 7 — Reflection Prompt

Route:

txt /(onboarding)/step-4-reflection.tsx 

Prompt:

txt What have you been thinking about lately? 

Purpose:

This is NOT a bio.

It should feel reflective and emotionally real.

Character limit:

txt 350 characters 

Examples shown subtly:

txt “I’ve been trying to learn how to slow down.”  “I miss conversations that wander naturally.” 

---

# Screen 8 — Glimps Creation

Route:

txt /(onboarding)/step-5-glimps.tsx 

Purpose:

Teach users what a Glimps actually is.

Educational copy:

txt A Glimps is not a profile photo.  It is a small moment from your world. 

User creates:

txt - photo or short video - optional reflection text - optional audio or music 

Rules:

txt minimum 1 Glimps required maximum 3 active Glimps 

Strong guidance:

txt - moments over selfies - atmosphere over posing - emotional texture over performance 

Examples:

txt - rainy window - train ride - coffee table - favorite book - late night city lights 

---

# Screen 9 — Discovery Explanation

Purpose:

Explain how Lingr differs from swipe apps.

Text examples:

txt You won’t see hundreds of people here.  Only a few.  Enough to actually notice someone. 

Explain:

txt - daily limited discovery - Sparks - gradual identity reveal - Layers 

---

# Screen 10 — Presence Promise

Route:

txt /(onboarding)/promise.tsx 

Purpose:

Create intentional emotional framing.

Example copy:

txt Lingr works best when people show up honestly, slow down a little, and treat each other gently. 

CTA:

txt I understand 

This screen is intentionally quiet and minimal.

---

# Screen 11 — Notification Permissions

Purpose:

Request push notification permission.

Timing:

Only after emotional investment has started.

Never immediately on app launch.

Reasoning shown first:

txt We’ll only notify you about moments that matter. 

Examples:

txt - someone Sparked you - a Layer unlocked - a new message arrived 

Avoid:

txt - urgency language - streak reminders - re-engagement spam 

---

# Screen 12 — Location Permissions

Purpose:

Enable local discovery.

Explanation first:

txt Lingr uses approximate location to introduce people near you. 

Rules:

txt - exact coordinates never exposed - city only shown at Layer 1+ - location used server-side only 

Fallback:

If denied:

txt - onboarding cannot complete - user shown explanatory modal 

---

# Screen 13 — Completion

Purpose:

Transition user emotionally into the product.

Text example:

txt Take your time.  There’s no rush here. 

CTA:

txt Enter Lingr 

Destination:

txt /(tabs) 

---

# Onboarding State Rules

Progress should persist server-side.

If app closes:

txt - resume where user left off - never restart onboarding unexpectedly 

Stored state:

txt users.onboarding_complete temporary onboarding progress state 

---

# UX Rules

---

# Important

The onboarding MUST NOT feel like:

txt - a personality test - a marketing funnel - a dating marketplace - social media onboarding 

It SHOULD feel like:

txt - entering a slower emotional space - a reflective journal - a calm invitation 

---

# Animation Principles

Allowed:

txt - fade - blur - soft parallax - slow transitions 

Avoid:

txt - bounce animations - confetti - flashy transitions - dopamine effects 

---

# Audio Philosophy

Audio is optional everywhere.

Users should never feel pressured to:

txt - record their voice - perform emotionally - appear extroverted 

Quiet users should feel equally welcome.

---

# Technical Notes

---

# Persistence

Onboarding progress should sync server-side after each step.

Reason:

txt prevents progress loss supports multi-device continuation 

---

# Media Uploads

Glimps uploads during onboarding should:

txt - upload immediately - validate server-side - generate signed temporary preview URLs 

---

# Validation

Validation happens:

txt - client-side for UX - server-side for security 

Server remains authoritative.

---

# Completion Trigger

Only after:

txt - required profile fields valid - at least 1 active Glimps exists - permissions handled 

Then:

txt users.onboarding_complete = true 

---

# Future Expansion

Potential future onboarding additions:

txt - optional voice introduction - optional values prioritization - pacing preference - emotional availability check-in - relationship history reflection 

These are intentionally excluded from V1.

Simplicity matters more than completeness.

---

Document version: 1.0
Status: Ready for implementation
