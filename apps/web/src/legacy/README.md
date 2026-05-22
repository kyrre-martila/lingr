# Legacy Web Artifacts Archive

This folder is an archive of pre-Next.js web code retained only for historical reference.

- It is **not** part of the active runtime path.
- The active web runtime is the Next.js App Router code under `apps/web/app`, `apps/web/components`, and `apps/web/lib`.
- Do not import archived files from active web runtime code.

As of Run 18.5 Prompt 1 cleanup, the old DOM-mount runtime entrypoints (`index.html`, `src/legacy/main.js`, and its route-page builders) were removed to reduce dual-architecture confusion.
