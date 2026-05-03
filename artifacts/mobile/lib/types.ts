export type Answer = 'A' | 'B' | 'C' | 'D' | 'E' | null;

export type DetectionStatus = 'SINGLE' | 'BLANK' | 'MULTIPLE' | 'LOW_CONFIDENCE';

export type IssueCode =
  | 'TEMPLATE_UNSUPPORTED_QUESTION_COUNT'
  | 'TEMPLATE_ALIGNMENT_LOW'
  | 'LOW_OVERALL_CONFIDENCE'
  | 'QUESTION_REVIEW_REQUIRED';

export interface QuestionDetection {
  questionNumber: number;
  detectedAnswer: Answer;
  status: DetectionStatus;
  confidence: number;
  correctedAnswer?: Answer;
  needsReview: boolean;
}

export interface PaperResult {
  id: string;
  label: string;
  studentName?: string;
  studentId?: string;
  imageUri?: string;
  detections: QuestionDetection[];
  issues: IssueCode[];
  finalAnswers: Answer[];
  score: number;
  maxScore: number;
  percentage: number;
  reviewComplete: boolean;
  createdAt: number;
}

export interface Assessment {
  id: string;
  title: string;
  answerKey: Answer[];
  questionCount: number;
  expectedPaperCount?: number;
  papers: PaperResult[];
  createdAt: number;
  updatedAt: number;
}
