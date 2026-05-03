export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'matching';
export type GradingMode = 'auto' | 'manual' | 'hybrid';
export type GradingSource = 'scan' | 'manual' | 'hybrid';

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  prompt?: string;
  correctAnswer?: string;
  correctBoolean?: boolean;
  expectedAnswer?: string;
  matchingPairs?: string;
  weight: number;
  gradingMode: GradingMode;
}

export interface QuestionResponse {
  questionId: string;
  type: QuestionType;
  selectedAnswer?: string;
  booleanAnswer?: boolean;
  textAnswer?: string;
  matchingAnswer?: string;
  manualScore?: number;
  maxScore: number;
  isCorrect?: boolean;
  confidence?: number;
  needsReview?: boolean;
  issueCodes: string[];
}

export interface StudentResult {
  id: string;
  assessmentId: string;
  studentName: string;
  studentId?: string;
  responses: QuestionResponse[];
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  issues: string[];
  gradingSource: GradingSource;
  confirmedAt: number;
}

export interface Assessment {
  id: string;
  title: string;
  questions: Question[];
  totalPoints: number;
  expectedPaperCount?: number;
  results: StudentResult[];
  createdAt: number;
  updatedAt: number;
}

export function calcEarnedPoints(responses: QuestionResponse[], questions: Question[]): number {
  let total = 0;
  for (const r of responses) {
    const q = questions.find(qq => qq.id === r.questionId);
    if (!q) continue;
    if (r.type === 'mcq' || r.type === 'true_false') {
      if (r.isCorrect) total += q.weight;
    } else {
      total += r.manualScore ?? 0;
    }
  }
  return total;
}

export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}

export function gradingModeForType(type: QuestionType): GradingMode {
  if (type === 'mcq' || type === 'true_false') return 'auto';
  return 'manual';
}
