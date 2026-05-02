import { Share } from 'react-native';
import type { Assessment } from './types';

export function generateCSV(assessment: Assessment): string {
  const rows: string[] = [];

  const questionHeaders = Array.from(
    { length: assessment.questionCount },
    (_, i) => `Q${i + 1}`
  );
  const headers = ['Paper', 'Score', 'Max', 'Percentage', ...questionHeaders];
  rows.push(headers.join(','));

  const keyRow = [
    'ANSWER KEY',
    '',
    '',
    '',
    ...assessment.answerKey.map(a => a ?? '-'),
  ];
  rows.push(keyRow.join(','));

  for (const paper of assessment.papers) {
    if (!paper.reviewComplete) continue;
    const row = [
      paper.label,
      paper.score.toString(),
      paper.maxScore.toString(),
      `${paper.percentage}%`,
      ...paper.finalAnswers.map(a => a ?? '-'),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

export async function exportCSV(assessment: Assessment): Promise<void> {
  const csv = generateCSV(assessment);
  const completedCount = assessment.papers.filter(p => p.reviewComplete).length;
  const title = `${assessment.title} - Results (${completedCount} papers)`;

  await Share.share(
    {
      message: csv,
      title,
    },
    {
      subject: title,
      dialogTitle: 'Export Results',
    }
  );
}
