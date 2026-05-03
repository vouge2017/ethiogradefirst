# Milestone 1 — Classroom-Usable MVP

## Definition of Done

Milestone 1 is complete when a teacher can walk through the full workflow below in a real classroom, with no internet, on an Android device, without assistance.

## Teacher Workflow Checklist

| Step | Feature | Status |
|------|---------|--------|
| 1 | Create new assessment (title + question count) | Done |
| 2 | Enter answer key (A–E per question) | Done |
| 3 | Scan paper with camera | Done (camera launches, result is simulated) |
| 4 | Import paper from gallery | Done |
| 5 | Enter answers manually (Manual Entry mode) | Done |
| 6 | Enter student name and optional ID | Done |
| 7 | Review detected/entered answers per question | Done |
| 8 | Correct any wrong or uncertain answers | Done |
| 9 | Confirm and save result | Done |
| 10 | View class results summary | Done |
| 11 | Export CSV with names, IDs, scores, answers | Done |
| 12 | Restart app and find all results intact | Done (AsyncStorage) |
| 13 | Tested on real Android device | Blocked — not yet tested |
| 14 | Camera permission works on Android | Unknown — not device-tested |
| 15 | CSV export/share works on Android | Unknown — not device-tested |

## P1 Items (Must Complete Before Classroom Pilot)

| ID | Item | Status |
|----|------|--------|
| P1.1 | Student name and ID in result model, review screen, CSV | Done |
| P1.2 | Manual entry mode with name/ID + per-question A–E tapping | Done |
| P1.3 | OMR clearly labeled as prototype simulation, not real detection | Done |
| P1.4 | Android device test — camera, gallery, CSV share, offline storage | Blocked |

## P2 Items (Should Complete Before Wider Rollout)

- Results screen: class average, per-question accuracy statistics
- Results screen: show student name prominently (not just "Paper N")
- CSV: export as a real .csv file attachment on Android (not just shared text)
- Home screen: swipe-to-delete assessments
- Setup screen: validation that answer key is fully filled before starting
- Scan screen: ability to skip back to setup without losing data

## P3 Items (Nice to Have / Future)

- Dark mode
- Multiple answer key formats (true/false, short answer placeholders)
- Real bubble-sheet image processing (replace simulated OMR)
- Amharic UI language option
- Batch scan mode (grade all papers without going to review between each)
- Per-student report card export

## Classroom Pilot Readiness Criteria

The app is ready for a classroom pilot when:
- All P1 items are done
- App runs without crash on a real Android device
- Camera and gallery import work
- CSV export produces a readable file
- Data persists across app restarts
- Teacher can complete the full workflow in under 5 minutes for a 20-question, 10-student assessment
