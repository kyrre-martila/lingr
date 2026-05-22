# Legacy DOM Runtime (Isolated)

This folder contains the pre-Next.js imperative DOM runtime used during migration.

- It is intentionally isolated from `app/` and React route surfaces.
- Core public/private routes in Next.js should not import this runtime.
- Keep this only for temporary reference/back-compat during transition.

TODO (future run): remove this folder once remaining non-Next test/prototype dependencies are retired.
