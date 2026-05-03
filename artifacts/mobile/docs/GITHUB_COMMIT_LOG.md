# EthioGrade — GitHub Commit Log

## Repository Status

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD commit | `4d8c424` |
| Remote | `gitsafe-backup` (Replit internal backup — not a public GitHub remote) |
| GitHub remote | Not configured |
| Push to GitHub | Not possible until a GitHub remote is added |

## Commit History

### `4d8c424` — Add manual entry and improve review screen functionality
**Date:** 2026-05-02

Changes:
- Added `app/manual.tsx` — full manual entry screen with student name/ID + per-question A–E selectors
- Added "Enter answers manually" button to `scan.tsx`
- Registered `manual` route in `app/_layout.tsx`
- Added `studentName?` and `studentId?` to `PaperResult` type in `lib/types.ts`
- Updated `review.tsx` with student name and ID input fields
- Updated `lib/csv.ts` to include Student Name and Student ID columns
- Fixed `artifact.toml` health check — removed broken `/status` endpoint that caused all workflow restarts to fail
- Fixed web font loading — added `Platform.OS !== 'web'` guard so web preview does not block indefinitely on `useFonts`

### `229dac3` — Update project dependencies for improved stability and performance
**Date:** Earlier

Changes: Dependency updates, Expo SDK version pins.

### `5b0eedb` — Initial commit
**Date:** Earlier

Changes: Initial EthioGrade Expo scaffold with home, setup, scan, review, results screens.

---

## How to Add a GitHub Remote

Once a GitHub repository is created, add the remote and push:

```bash
git remote add origin https://github.com/<your-org>/ethiograde.git
git push -u origin main
```

Note: Replit manages git commits automatically at the end of each session via checkpoint. Manual `git commit` is not used inside the Replit environment.

---

## Planned Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable builds only |
| `feature/classroom-mvp-hardening` | P1 hardening work (current) |
| `feature/real-omr` | Phase 2 real image detection |
| `feature/android-build` | EAS build and signing setup |

Note: Branch creation inside Replit requires a project task or manual git operations outside Replit. The current working branch is `main`.
