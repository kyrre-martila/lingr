# Run 9 — Localization Foundation

## Architecture decisions
- Added namespace-scoped i18n tree in `apps/web/src/i18n/` with `common`, `auth`, `chat`, `discovery`, `onboarding`, `errors`, `regions`.
- Canonical source locale is `en`; launch translation locale is `nb-NO`.
- Added lightweight runtime (`apps/web/src/i18n/index.js`) for locale resolution, fallback behavior, translation lookup, and DOM binding.
- Kept backend reason codes canonical and untranslated; frontend maps reason codes to `errors.*` keys.

## Migrated areas (high-touch only)
- Discovery key-paths remain translation-key driven with fallback behavior.
- Shared locale bootstrapping + translation application integrated into web app render path.
- Error translation pathway established via reason-code-to-key mapping contract.

## Deferred migration work
- Full landing-page/string migration.
- Full profile/onboarding copy replacement.
- Localized country and region display name catalogs.
- User profile locale persistence through API (`user.profile.locale`) once profile contracts are expanded.

## Anti-patterns avoided
- No giant monolithic translation file.
- No backend localization contract changes.
- No broad rewrite of every screen.
- No overengineered dynamic i18n loading pipeline at this phase.

## Risks
- Existing components still contain legacy literals outside migrated high-touch paths.
- Missing-key fallback currently returns key token (safe, but user-visible if coverage lags).
- Locale preference currently local-storage driven until profile locale sync lands.
