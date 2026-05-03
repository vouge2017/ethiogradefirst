/**
 * PROTOTYPE SIMULATION — NOT REAL OMR
 *
 * This module is a MOCK/SIMULATION using Math.random().
 * The imageUri parameter is NEVER READ. No image processing happens.
 * Only MCQ and True/False questions are simulated.
 * Short Answer and Matching always require manual scoring.
 *
 * See docs/OMR_STATUS.md for details and the upgrade path to real OMR.
 */
import type { Assessment, Question, QuestionResponse, StudentResult, GradingSource } from './types';
import { calcEarnedPoints, makeId } from './types';

const MCQ_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

function mockMcqResponse(q: Question): QuestionResponse {
  const rand = Math.random();
  if (rand < 0.72) {
    const answer = (q.correctAnswer && Math.random() < 0.70)
      ? q.correctAnswer
      : MCQ_OPTIONS[Math.floor(Math.random() * 5)];
    return {
      questionId: q.id, type: 'mcq', selectedAnswer: answer, maxScore: q.weight,
      isCorrect: answer === q.correctAnswer, confidence: 0.80 + Math.random() * 0.19,
      needsReview: false, issueCodes: [],
    };
  } else if (rand < 0.85) {
    const answer = MCQ_OPTIONS[Math.floor(Math.random() * 5)];
    return {
      questionId: q.id, type: 'mcq', selectedAnswer: answer, maxScore: q.weight,
      isCorrect: answer === q.correctAnswer, confidence: 0.35 + Math.random() * 0.30,
      needsReview: true, issueCodes: ['LOW_CONFIDENCE'],
    };
  } else if (rand < 0.93) {
    return {
      questionId: q.id, type: 'mcq', selectedAnswer: undefined, maxScore: q.weight,
      isCorrect: false, confidence: 0.90, needsReview: true, issueCodes: ['BLANK'],
    };
  } else {
    const answer = MCQ_OPTIONS[Math.floor(Math.random() * 5)];
    return {
      questionId: q.id, type: 'mcq', selectedAnswer: answer, maxScore: q.weight,
      isCorrect: answer === q.correctAnswer, confidence: 0.40 + Math.random() * 0.25,
      needsReview: true, issueCodes: ['MULTIPLE_MARKS'],
    };
  }
}

function mockTrueFalseResponse(q: Question): QuestionResponse {
  const rand = Math.random();
  if (rand < 0.80) {
    const answer = (q.correctBoolean !== undefined && Math.random() < 0.75)
      ? q.correctBoolean
      : Math.random() < 0.5;
    return {
      questionId: q.id, type: 'true_false', booleanAnswer: answer, maxScore: q.weight,
      isCorrect: answer === q.correctBoolean, confidence: 0.82 + Math.random() * 0.17,
      needsReview: false, issueCodes: [],
    };
  } else {
    const answer = Math.random() < 0.5;
    return {
      questionId: q.id, type: 'true_false', booleanAnswer: answer, maxScore: q.weight,
      isCorrect: answer === q.correctBoolean, confidence: 0.35 + Math.random() * 0.30,
      needsReview: true, issueCodes: ['LOW_CONFIDENCE'],
    };
  }
}

export function mockOmrDetection(
  imageUri: string,
  assessment: Assessment,
  paperIndex: number,
): StudentResult {
  console.log('[MockOMR] Simulation started for paper', paperIndex + 1);
  console.log('[MockOMR] imageUri received but NOT READ:', imageUri.substring(0, 40) + '...');

  const responses: QuestionResponse[] = assessment.questions.map(q => {
    if (q.type === 'mcq') return mockMcqResponse(q);
    if (q.type === 'true_false') return mockTrueFalseResponse(q);
    console.log('[MockOMR] Q' + q.number + ' (' + q.type + ') requires manual scoring — skipping auto-detection');
    return {
      questionId: q.id, type: q.type, maxScore: q.weight,
      needsReview: true, issueCodes: ['REQUIRES_MANUAL_SCORING'],
    };
  });

  const hasManual = assessment.questions.some(q => q.type === 'short_answer' || q.type === 'matching');
  const hasAuto = assessment.questions.some(q => q.type === 'mcq' || q.type === 'true_false');
  const gradingSource: GradingSource = hasManual && hasAuto ? 'hybrid' : hasManual ? 'manual' : 'scan';

  const earnedPoints = calcEarnedPoints(responses, assessment.questions);
  const allIssues = [...new Set(responses.flatMap(r => r.issueCodes))];

  console.log('[MockOMR] Simulation complete. Source:', gradingSource, 'Draft pts:', earnedPoints, '/', assessment.totalPoints);

  return {
    id: makeId(),
    assessmentId: assessment.id,
    studentName: `Paper ${paperIndex + 1}`,
    responses,
    earnedPoints,
    totalPoints: assessment.totalPoints,
    percentage: assessment.totalPoints > 0 ? Math.round((earnedPoints / assessment.totalPoints) * 100) : 0,
    issues: allIssues,
    gradingSource,
    confirmedAt: 0,
  };
}
