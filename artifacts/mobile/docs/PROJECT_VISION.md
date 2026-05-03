# EthioGrade — Project Vision

## Long-Term Vision

EthioGrade is the foundation for an **end-to-end AI agent system for teachers in Ethiopia**. The ultimate goal is a suite of AI agents that handles the full teacher workload — from creating assessments to communicating results to parents — entirely in the Ethiopian classroom context, including offline-first operation, local language support, and low-cost device compatibility.

## Current Milestone: Offline Grading MVP (Milestone 1)

Before any AI agent work begins, EthioGrade must prove it can handle one real classroom grading session without internet. This means:

1. A teacher opens the app with no internet connection
2. Creates a quick assessment with an answer key
3. Grades student papers by camera scan or manual entry
4. Reviews and corrects any uncertain answers
5. Exports a useful CSV summary
6. Restarts the app and finds all results still saved

This milestone is intentionally narrow. It is about correctness and usability, not features.

## What Is Intentionally NOT Being Built Yet

The following are future phases and must not be built until Milestone 1 is complete and validated in a real classroom:

- AI grading or essay scoring of any kind
- OCR / handwriting recognition
- Real bubble-sheet image processing (current OMR is a simulation)
- User accounts, login, or authentication
- Backend server or database
- Parent communication features
- Multi-school or admin dashboards
- Payment or subscription features
- Amharic / Afaan Oromo / Tigrinya language support (future)
- Play Store public release

## Why Ethiopia

Ethiopian primary and secondary schools face acute teacher workload pressure. Class sizes of 60–80 students are common. Grading 60 standardized answer sheets by hand takes a teacher 2–3 hours. EthioGrade's long-term goal is to reduce this to under 10 minutes per class, with no internet required.

## Design Principles

- **Offline first** — the app must work with zero connectivity at all times
- **Teacher time as the constraint** — every screen should minimize taps
- **Honest about limitations** — never claim AI or real OMR when it is simulated
- **Low-cost device compatible** — targets Android devices under $100
