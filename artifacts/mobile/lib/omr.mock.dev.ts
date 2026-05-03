/**
 * MOCK OMR — DEV REFERENCE ONLY
 *
 * THIS FILE IS NOT IMPORTED ANYWHERE IN THE PRODUCTION APP.
 * It is kept here as a reference for the OMR simulation that was
 * used during early development before the fake scan was removed.
 *
 * The fake scan was removed in the v0.1 release because it used
 * Math.random() and never actually read any image, which was
 * misleading to teachers.
 *
 * See docs/SCANNING_ROADMAP.md for the plan to add real scanning.
 * See docs/OMR_STATUS.md for current status.
 *
 * DO NOT import this file in production screens.
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
  const responses: QuestionResponse[] = assessment.questions.map(q => {
    if (q.type === 'mcq') return mockMcqResponse(q);
    if (q.type === 'true_false') return mockTrueFalseResponse(q);
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
