import { Share } from 'react-native';
import type { Assessment, Question, QuestionResponse } from './types';

function esc(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function gradeBand(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function responseDisplay(q: Question, r: QuestionResponse): string {
  if (r.type === 'mcq') return r.selectedAnswer ?? '—';
  if (r.type === 'true_false') {
    if (r.booleanAnswer === true) return 'T';
    if (r.booleanAnswer === false) return 'F';
    return '—';
  }
  return r.manualScore !== undefined ? `${r.manualScore}/${q.weight}` : `—/${q.weight}`;
}

export function generateCSV(assessment: Assessment): string {
  const rows: string[] = [];

  const qHeaders = assessment.questions.map(
    q => `Q${q.number}(${q.type === 'mcq' ? 'MCQ' : q.type === 'true_false' ? 'T/F' : q.type === 'short_answer' ? 'Short' : 'Match'})`
  );

  rows.push([
    'Assessment Title', 'Student Name', 'Student ID',
    'Earned', 'Total', 'Percentage', 'Grade',
    'Confirmed At',
    ...qHeaders,
  ].join(','));

  const keyRow = [
    esc(assessment.title), 'ANSWER KEY', '',
    '', assessment.totalPoints.toString(), '', '',
    '',
    ...assessment.questions.map(q => {
      if (q.type === 'mcq') return q.correctAnswer ?? '—';
      if (q.type === 'true_false') return q.correctBoolean === true ? 'T' : q.correctBoolean === false ? 'F' : '—';
      return `${q.weight}pts`;
    }),
  ];
  rows.push(keyRow.join(','));

  const confirmed = assessment.results.filter(r => r.confirmedAt > 0);
  for (const result of confirmed.sort((a, b) => b.percentage - a.percentage)) {
    const qCols = assessment.questions.map(q => {
      const resp = result.responses.find(r => r.questionId === q.id);
      return resp ? responseDisplay(q, resp) : '—';
    });
    rows.push([
      esc(assessment.title),
      esc(result.studentName),
      esc(result.studentId ?? ''),
      result.earnedPoints.toString(),
      result.totalPoints.toString(),
      `${result.percentage}%`,
      gradeBand(result.percentage),
      esc(formatDateTime(result.confirmedAt)),
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
