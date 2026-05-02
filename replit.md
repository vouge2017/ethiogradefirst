# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### EthioGrade Mobile App (`artifacts/mobile`)
Offline-first Ethiopian exam grading app built with Expo + React Native.

**Purpose:** Help Ethiopian teachers grade objective (multiple-choice) exams faster by scanning bubble-sheet answer papers, detecting answers with confidence scoring, reviewing/correcting detections, calculating scores, and exporting CSV results.

**Key Features:**
- Quick Assessment mode (no student database required)
- OMR detection with confidence classification (SINGLE/BLANK/MULTIPLE/LOW_CONFIDENCE)
- Teacher review screen with per-question correction
- Results screen with class stats (avg, pass rate)
- CSV export via Android Share sheet
- Fully offline — all data in AsyncStorage

**Navigation:** Stack-based (no tabs) — index → setup → scan → review → results

**Release Docs:** `artifacts/mobile/docs/release/`
- PLAY_STORE_RELEASE_CHECKLIST.md
- STORE_LISTING_DRAFT.md
- PRIVACY_POLICY_DRAFT.md
- DATA_SAFETY_NOTES.md
- INTERNAL_TESTING_PLAN.md
- KNOWN_LIMITATIONS.md
- TEACHER_PILOT_SCRIPT.md

### API Server (`artifacts/api-server`)
Express 5 + TypeScript server. Currently serves health check only.

### Canvas / Mockup Sandbox (`artifacts/mockup-sandbox`)
Design prototyping sandbox.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
