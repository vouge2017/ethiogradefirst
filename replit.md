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

**Purpose:** Help Ethiopian teachers grade mixed-type exams (MCQ, True/False, Short Answer, Matching) with per-question weights, hybrid scan+manual grading, and weighted scoring.

**Data Model (v2 — `ethiograde_v2` AsyncStorage key):**
- `Assessment` → `questions: Question[]`, `totalPoints`, `results: StudentResult[]`
- `Question` → `{id, number, type: QuestionType, weight, gradingMode, correctAnswer?, correctBoolean?}`
- `StudentResult` → `{id, studentName, studentId?, responses, earnedPoints, totalPoints, percentage, confirmedAt, gradingSource, issues}`
- `QuestionResponse` → `{questionId, type, selectedAnswer?, booleanAnswer?, manualScore?, maxScore, isCorrect?, confidence?, issueCodes[]}`
- `confirmedAt === 0` = pending draft; `confirmedAt > 0` = confirmed result

**Key Features:**
- 4 question types: MCQ (A-E bubbles), True/False, Short Answer, Matching
- Per-question weight (pts) — weighted scoring across all types
- OMR detection — PROTOTYPE SIMULATION ONLY (Math.random(), imageUri never read)
- Hybrid grading: MCQ/T-F auto-scored from scan; Short/Matching require manual score in review
- Manual Entry mode — full direct entry for all question types
- Teacher review screen: correct MCQ/T-F answers, enter manual scores
- Results: confirmed vs pending split, class avg/pass rate stats
- CSV export: Student Name, Student ID, Earned, Total, %, per-question columns
- Fully offline — all data in AsyncStorage (key: `ethiograde_v2`)

**Navigation:** Stack-based — index → setup → scan → (review | manual) → results

**Important:** OMR is simulated. See `docs/OMR_STATUS.md`. Not ready for Play Store.

**Key lib files:**
- `lib/types.ts` — all shared types + calcEarnedPoints, makeId, gradingModeForType
- `lib/omr.ts` — mockOmrDetection() simulation (explicit label)
- `lib/storage.ts` — AsyncStorage CRUD (key: ethiograde_v2)
- `lib/csv.ts` — generateCSV / exportCSV for new model
- `context/AssessmentContext.tsx` — beginAssessment, addResult, updateResult

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
