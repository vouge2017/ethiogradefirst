import { Share } from 'react-native';
import type { Assessment, Question, QuestionResponse } from './types';

function esc(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function responseDisplay(q: Question, r: QuestionResponse): string {
  if (r.type === 'mcq') return r.selectedAnswer ?? '—';
  if (r.type === 'true_false') {
    if (r.booleanAnswer === true) return 'T';
    if (r.booleanAnswer === false) return 'F';
    return '—';
  }
  return `${r.manualScore ?? '—'}/${q.weight}`;
}

export function generateCSV(assessment: Assessment): string {
  const rows: string[] = [];
  const qHeaders = assessment.questions.map(q => `Q${q.number}(${q.type[0].toUpperCase()})`);
  rows.push(['Student Name', 'Student ID', 'Earned', 'Total', 'Percentage', ...qHeaders].join(','));

  const keyRow = [
    'ANSWER KEY', '', '', assessment.totalPoints.toString(), '',
    ...assessment.questions.map(q => {
      if (q.type === 'mcq') return q.correctAnswer ?? '—';
      if (q.type === 'true_false') return q.correctBoolean === true ? 'T' : q.correctBoolean === false ? 'F' : '—';
      return `${q.weight}pts`;
    }),
  ];
  rows.push(keyRow.join(','));

  const confirmed = assessment.results.filter(r => r.confirmedAt > 0);
  for (const result of confirmed) {
    const qCols = assessment.questions.map(q => {
      const resp = result.responses.find(r => r.questionId === q.id);
      return resp ? responseDisplay(q, resp) : '—';
    });
    rows.push([
      esc(result.studentName),
      esc(result.studentId ?? ''),
      result.earnedPoints.toString(),
      result.totalPoints.toString(),
      `${result.percentage}%`,
      ...qCols,
    ].join(','));
  }
  return rows.join('\n');
}

export async function exportCSV(assessment: Assessment): Promise<void> {
  const csv = generateCSV(assessment);
  const count = assessment.results.filter(r => r.confirmedAt > 0).length;
  const title = `${assessment.title} — Results (${count} students)`;
  await Share.share({ message: csv, title }, { subject: title, dialogTitle: 'Export Results' });
}
