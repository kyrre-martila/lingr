# Run 1 Review — Lingr

## 1) Summary
Run 1 has a strong direction: the experience communicates **slow dating, emotional presence, and intentional pacing** in both copy and interaction patterns. The implementation is currently a single-page, component-factory architecture (plain JS + shared CSS) with mostly consistent semantic structure and a coherent visual language.

The biggest risks are maintainability and system drift: many components embed large template literals, there is repeated flow/state logic, color tokens are partially hard-coded outside the token system, and there are accessibility gaps around dynamic state announcements, focus behavior, and mobile navigation closure.

Overall: excellent philosophical alignment and promising UX tone, but now needs a structured refactor pass into reusable primitives and tighter a11y/design-system guardrails.

## 2) What is working well

- **Philosophy alignment is explicit and persistent** across hero, philosophy, discovery, conversations, and onboarding copy (e.g., “no swiping,” pacing limits, reflective prompts, pause mechanics). This strongly matches Lingr’s principles.  
- **Architecture is modular at section level**: each major section is isolated in its own factory function and composed centrally in `main.js`, which keeps entry orchestration simple.  
- **Good use of semantic regions** (`section`, `article`, `header`, lists, `aria-labelledby`) in many places, improving baseline readability and accessibility.  
- **Calm visual consistency**: warm palette, serif/sans pairing, soft shadows, low-contrast borders, generous spacing, and subtle motion contribute to a premium, non-addictive feeling.  
- **Deliberate anti-compulsion patterns** are implemented in behavior, not just copy: limited introductions, pause states, no swipe interactions, and “send gently” framing.  
- **Reasonable mobile-first CSS foundation** with single-column defaults and progressive multi-column layouts at breakpoints.

## 3) Main issues found

### A. Repeated state-machine logic across flows
Onboarding and Glimps creation each reimplement similar step flow concerns: state persistence from `FormData`, per-step validation, render-step switching, back/next behavior, and animated step transitions. This creates parallel logic and future bug divergence risk.

### B. Single-page section stacking is reaching complexity limits
`main.js` appends many feature sections in one linear page. This is fine for prototype/demo, but product surfaces like onboarding, discovery, conversations, and profile experience are now feature-sized and likely need route-level separation to keep cognitive load, performance, and code ownership manageable.

### C. Hard-coded temporal content reduces trust
Several strings use relative time language (“Today,” “Tomorrow morning,” “In 6 hours”) as static mock data. For a product emphasizing emotional trust and intentionality, stale temporal labels can feel broken quickly.

### D. Large template literals reduce maintainability
Many components contain large `innerHTML` blocks that combine structure, content, and behavior assumptions in one place. This slows safe edits and makes incremental accessibility improvements harder.

## 4) Duplications or inconsistencies

- **Naming inconsistency:** `Glimps` vs `glimpse/glimpses` appears across class names, copy, and IDs (`glimps-grid`, `glimpse-card`, “Create a Glimps,” “Glimps gallery”). The product term should have a canonical grammar across UI/content/code.
- **Flow duplication:** onboarding and Glimps flow duplicate wizard mechanics (step host, progress, validation, error rendering, back/next semantics).
- **Panel/card style repetition:** multiple components repeat similar card/panel treatment with small variation (`card`, `soft-panel`, conversation panels, discovery previews, glimpse cards) without a clear primitive hierarchy.
- **Token bypasses:** many colors are direct hex/alpha values instead of semantic tokens, especially borders, muted text variants, hover states, and shadows.
- **Container-shell duplication:** multiple sections re-define similar shell patterns (`onboarding-shell`, `profile-shell`, `discovery-shell`) that could be standardized via layout utilities.

## 5) Accessibility concerns

- **Mobile nav interaction is incomplete:** opening the mobile menu does not appear to close on link selection or Escape; no focus-management trap/return behavior is present.
- **Live-region noise risk:** persistent `role="alert" aria-live="assertive"` error containers in forms can become over-announcing if not carefully toggled.
- **Progressbar semantics may be off:** the introductions track uses a progressbar but visually represents “used vs open segments”; this may be better conveyed as list/status text to avoid misleading assistive interpretation.
- **Keyboard flow could be improved:** interactive cards are focusable in some places (`tabIndex=0`) but do not always expose meaningful keyboard action parity.
- **Form success states rely on text mutation only:** completion feedback and disabled buttons should include clear state announcement and possibly focus transition.
- **Potential heading hierarchy drift:** some nested sections use `h4` under `h2/h3` combinations; check strict hierarchy and landmarks for screen-reader outline clarity.

## 6) Design/system concerns

- **Design token system is partial**: spacing and base colors are tokenized, but many component colors/shadows/radii are one-off literals. This weakens themeability and long-term consistency.
- **Motion consistency** is mostly calm, but transitions vary by component and duration without clear motion tokens.
- **Responsive quality is good but uneven**: major layout shifts are sensible, though component internals (conversation detail height, control density, long-copy wrapping) should be tested on narrow devices and landscape.
- **Premium calm feel is largely successful** visually, but repeated micro-interaction lifts (`translateY`) across many surfaces can accumulate into a busier feel than intended.

## 7) Suggested refactor plan

1. **Introduce shared flow engine (high ROI):** extract a small reusable step-flow controller for onboarding and Glimps to centralize step state, validation hooks, transitions, and announcement behavior.
2. **Define design tokens v2:** add semantic tokens for border tiers, surface tiers, text-muted levels, shadow levels, and motion durations/easing; replace raw hex values progressively.
3. **Create UI primitives:** standardize `Panel`, `Card`, `SectionHeader`, `PillList`, `ActionRow`, and `StatusNotice` class contracts to reduce CSS duplication.
4. **Harden accessibility pass:** mobile nav keyboard/focus behavior, live-region strategy, status announcements, and consistent control labeling.
5. **Route strategy proposal:** split prototype into route-level pages (`/`, `/discovery`, `/conversations`, `/profile`, `/onboarding`) while retaining the same component modules where possible.
6. **Content/time abstraction:** isolate time labels and mock state in formatters/data adapters so the UI can transition to real time safely.
7. **Terminology normalization:** enforce canonical Lingr lexicon (especially “Glimps” singular/plural usage) in code and copy.

## 8) Prioritized next steps

### Priority 0 (immediate)
- Freeze feature additions and run a focused a11y remediation pass on navigation + forms.
- Decide and document canonical product terminology (“Glimps” grammar rules).

### Priority 1
- Extract shared step-flow utility and migrate onboarding + Glimps flow.
- Introduce semantic token layers and replace the most repeated hard-coded values.

### Priority 2
- Consolidate duplicated panel/card styling into primitives/utilities.
- Refine motion system to keep interaction cues subtle and consistent.

### Priority 3
- Plan route decomposition and information architecture transition from single long page to scoped pages.
- Add lightweight UI architecture docs mapping components to Lingr principles so future prompts can review philosophy fit during implementation.

---

## Concrete file/component references reviewed

- `apps/web/src/main.js`
- `apps/web/src/styles/main.css`
- `apps/web/src/components/navigation.js`
- `apps/web/src/components/hero.js`
- `apps/web/src/components/philosophy.js`
- `apps/web/src/components/how-it-works.js`
- `apps/web/src/components/discovery.js`
- `apps/web/src/components/glimps.js`
- `apps/web/src/components/glimps/create-flow.js`
- `apps/web/src/components/conversations/index.js`
- `apps/web/src/components/conversations/mock-data.js`
- `apps/web/src/components/profile-experience.js`
- `apps/web/src/components/onboarding/index.js`
- `apps/web/src/components/onboarding/form-controls.js`
