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
- OMR detection — PROTOTYPE SIMULATION ONLY (Math.random(), imageUri never read)
- Confidence classification: SINGLE / BLANK / MULTIPLE / LOW_CONFIDENCE
- Manual Entry mode — bypass camera, tap A–E per question
- Student name + optional ID on every result
- Teacher review screen with per-question correction (mandatory before confirm)
- Results screen with class stats (avg, pass rate)
- CSV export: Student Name, Student ID, Score, Max, %, per-question answers
- Fully offline — all data in AsyncStorage

**Navigation:** Stack-based — index → setup → scan → (review | manual) → results

**Important:** OMR is simulated. See `docs/OMR_STATUS.md`. Not ready for Play Store.

**Docs:** `artifacts/mobile/docs/`
- PROJECT_VISION.md — long-term AI agent vision, current milestone scope
- MILESTONE_1_CLASSROOM_MVP.md — done criteria, P1/P2/P3 checklist
- AI_AGENT_ROADMAP.md — 6 future AI agents, all phase 2+
- OMR_STATUS.md — simulation details, limitations, upgrade path
- GITHUB_COMMIT_LOG.md — branch, commit history, GitHub setup instructions
- `release/` — Play Store draft docs (not ready for submission)

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
