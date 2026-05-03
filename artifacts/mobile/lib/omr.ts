/**
 * PROTOTYPE / SIMULATION — NOT REAL OMR
 *
 * This module simulates Optical Mark Recognition (OMR) using Math.random().
 * The `imageUri` parameter is accepted but NEVER READ. No image processing
 * takes place. All detection results are randomly generated.
 *
 * This simulation exists to make the teacher review flow functional during
 * development. It must be replaced with real bubble-detection logic before
 * EthioGrade is used for actual grading decisions.
 *
 * See docs/OMR_STATUS.md for full details, limitations, and the upgrade path.
 */
import type { Answer, DetectionStatus, IssueCode, QuestionDetection, PaperResult } from './types';

const ANSWERS: Answer[] = ['A', 'B', 'C', 'D', 'E'];

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function simulateQuestionDetection(
  questionNumber: number,
  answerKey: Answer[]
): QuestionDetection {
  const rand = Math.random();
  let status: DetectionStatus;
  let detectedAnswer: Answer;
  let confidence: number;

  if (rand < 0.72) {
    status = 'SINGLE';
    confidence = 0.80 + Math.random() * 0.19;
    // Bias toward correct answer ~70% of the time
    detectedAnswer = Math.random() < 0.70
      ? answerKey[questionNumber - 1]!
      : ANSWERS[Math.floor(Math.random() * 5)]!;
  } else if (rand < 0.85) {
    status = 'LOW_CONFIDENCE';
    confidence = 0.35 + Math.random() * 0.30;
    detectedAnswer = ANSWERS[Math.floor(Math.random() * 5)]!;
  } else if (rand < 0.93) {
    status = 'BLANK';
    confidence = 0.90 + Math.random() * 0.09;
    detectedAnswer = null;
  } else {
    status = 'MULTIPLE';
    confidence = 0.40 + Math.random() * 0.25;
    detectedAnswer = ANSWERS[Math.floor(Math.random() * 5)]!;
  }

  const needsReview = status === 'LOW_CONFIDENCE' || status === 'MULTIPLE' || status === 'BLANK';

  return {
    questionNumber,
    detectedAnswer,
    status,
    confidence,
    needsReview,
  };
}

export function runOMRDetection(
  imageUri: string,
  answerKey: Answer[],
  paperIndex: number
): PaperResult {
  const questionCount = answerKey.length;
  const detections: QuestionDetection[] = Array.from({ length: questionCount }, (_, i) =>
    simulateQuestionDetection(i + 1, answerKey)
  );

  const issues: IssueCode[] = [];

  if (questionCount !== 20) {
    issues.push('TEMPLATE_UNSUPPORTED_QUESTION_COUNT');
  }

  const avgConfidence = detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
  if (avgConfidence < 0.65) {
    issues.push('LOW_OVERALL_CONFIDENCE');
  }

  const lowConfidenceCount = detections.filter(d => d.needsReview).length;
  if (lowConfidenceCount > 0) {
    issues.push('QUESTION_REVIEW_REQUIRED');
  }

  const hasAlignmentIssue = Math.random() < 0.15;
  if (hasAlignmentIssue) {
    issues.push('TEMPLATE_ALIGNMENT_LOW');
  }

  const finalAnswers: Answer[] = detections.map(d => d.detectedAnswer);
  const score = calculateScore(finalAnswers, answerKey);

  return {
    id: generateId(),
    label: `Paper ${paperIndex + 1}`,
    imageUri,
    detections,
    issues,
    finalAnswers,
    score,
    maxScore: questionCount,
    percentage: questionCount > 0 ? Math.round((score / questionCount) * 100) : 0,
    reviewComplete: false,
    createdAt: Date.now(),
  };
}

export function calculateScore(finalAnswers: Answer[], answerKey: Answer[]): number {
  let score = 0;
  for (let i = 0; i < answerKey.length; i++) {
    if (finalAnswers[i] !== null && finalAnswers[i] === answerKey[i]) {
      score++;
    }
  }
  return score;
}

export function applyCorrections(paper: PaperResult, answerKey: Answer[]): PaperResult {
  const finalAnswers: Answer[] = paper.detections.map(d =>
    d.correctedAnswer !== undefined ? d.correctedAnswer : d.detectedAnswer
  );
  const score = calculateScore(finalAnswers, answerKey);
  return {
    ...paper,
    finalAnswers,
    score,
    percentage: answerKey.length > 0 ? Math.round((score / answerKey.length) * 100) : 0,
    reviewComplete: true,
  };
}

export function getIssueLabel(code: IssueCode): string {
  switch (code) {
    case 'TEMPLATE_UNSUPPORTED_QUESTION_COUNT':
      return 'Unsupported question count';
    case 'TEMPLATE_ALIGNMENT_LOW':
      return 'Sheet alignment issue detected';
    case 'LOW_OVERALL_CONFIDENCE':
      return 'Low overall detection confidence';
    case 'QUESTION_REVIEW_REQUIRED':
      return 'Some answers need review';
  }
}

export function getStatusLabel(status: DetectionStatus): string {
  switch (status) {
    case 'SINGLE': return 'Clear';
    case 'BLANK': return 'Blank';
    case 'MULTIPLE': return 'Multiple marks';
    case 'LOW_CONFIDENCE': return 'Uncertain';
  }
}
