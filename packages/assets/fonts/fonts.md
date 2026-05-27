# Lingr Typography System

This document defines the official typography system for Lingr.

These rules are the single source of truth for all typography decisions across:

- Web app
- Mobile app
- Marketing website
- Splash screens
- Onboarding
- Product UI

Do not introduce new fonts unless explicitly approved.

---

# Primary Font

## Plus Jakarta Sans

Lingr uses **Plus Jakarta Sans** as the official UI font.

Reasoning:

- Warm and human feeling
- Calm and premium aesthetic
- Soft geometric appearance
- Editorial feel without looking corporate
- Consistent across web and mobile

Font files:

```txt
/packages/assets/fonts/plus-jakarta-sans/
├── PlusJakartaSans-VariableFont_wght.ttf
└── PlusJakartaSans-VariableFont_wght.woff2
```

Usage:

- Web → `.woff2`
- Mobile → `.ttf`

Do not fetch fonts from Google Fonts or third-party CDNs.

Fonts must always be self-hosted.

---

# Font Usage Rules

## Use Plus Jakarta Sans for:

### UI Text

- Buttons
- Labels
- Forms
- Navigation
- Menus
- Inputs
- Chat UI
- Settings
- Empty states

### Marketing Text

- Headlines
- Subheadings
- Landing pages
- Promotional sections

### Emotional / Brand Text

- Splash screen tagline
- Welcome messages
- Onboarding copy
- Reflection prompts
- Match prompts

---

# Font Weights

Lingr uses a restrained typography system.

Prefer:

- `400` → regular body text
- `500` → standard UI emphasis
- `600` → headings and important actions

Avoid excessive boldness.

Do not use:

- `700+` unless explicitly needed
- ultra thin weights
- visually aggressive typography

Lingr should feel soft, calm, and intentional.

---

# Typography Principles

Lingr is not a high-energy social app.

Typography should feel:

- Calm
- Warm
- Human
- Intentional
- Spacious
- Soft

Avoid typography that feels:

- Tech startup
- Gaming UI
- Corporate SaaS
- High dopamine
- Loud or aggressive

---

# Letter Spacing

Prefer slightly tighter tracking for premium feel.

Recommended:

```css
letter-spacing: -0.02em;
```

Large headlines may use:

```css
letter-spacing: -0.03em;
```

Avoid overly spaced typography.

---

# Responsive Typography

Typography should use tokens and `clamp()`.

Do not hardcode pixel font sizes.

Example:

```css
--text-body:
  clamp(1rem, 0.95rem + 0.2vw, 1.125rem);

--text-heading:
  clamp(2rem, 1.5rem + 1vw, 3rem);

--text-splash-copy:
  clamp(1.15rem, 0.95rem + 0.65vw, 1.55rem);
```

---

# Splash Screen Typography

Splash tagline:

**"Some people are worth to lingr 💕"**

Style:

- Font: Plus Jakarta Sans
- Weight: `500`
- Alignment: center
- Soft peach color
- Calm spacing
- Slightly tighter tracking

Example:

```css
font-family: var(--font-ui);
font-weight: 500;
letter-spacing: -0.02em;
line-height: 1.2;
```

---

# Logo Typography

The Lingr logo is **not text rendered from a font**.

Use:

```txt
/packages/assets/logos/lingr/
├── lingr-logo.svg
└── lingr-heart.svg
```

Do not recreate the Lingr logo using a font.

Always use the SVG assets.

---

# Rules For AI/Codex

Never introduce alternative fonts.

Never use:

- Inter
- Poppins
- Montserrat
- SF Pro
- Roboto
- random design-system fonts

unless explicitly approved.

When building UI:

1. Use Plus Jakarta Sans.
2. Use typography tokens.
3. Use `clamp()` sizing.
4. Keep typography calm and spacious.
5. Follow Lingr visual tone.
