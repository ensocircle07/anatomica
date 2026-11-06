# ADR-0007: Repository and hosting

- **Status:** Accepted
- **Date:** 2026-11-06

## Decision
- GitHub account: **ensocircle07**
- Repository: **`ensocircle07/anatomica`** (public)
- Site: **https://ensocircle07.github.io/anatomica/**
- Vite `base: "/anatomica/"`
- Deployment: official GitHub Actions Pages workflow on push to `main`.

## Git identity (resolved)
Global Git identity, set 2026-11-06:

- `user.name = ensocircle07`
- `user.email = 105887785+ensocircle07@users.noreply.github.com` (GitHub no-reply address)

Commits are linked to the `ensocircle07` account, and no personal email appears in the public repository history.

## Consequences
- If a custom domain is added later, `base` changes to `/` and route shells are regenerated.
