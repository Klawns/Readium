import type { BookMetrics } from '@/types';
import { formatNumber, formatPercent } from './insight-formatters';

export interface InsightHighlight {
  id: string;
  label: string;
  value: string;
}

export const buildInsightHighlights = (metrics?: BookMetrics): InsightHighlight[] => {
  if (!metrics) {
    return [];
  }

  return [
    { id: 'books', label: 'Livros', value: formatNumber(metrics.totalBooks) },
    { id: 'reading', label: 'Lendo agora', value: formatNumber(metrics.readingBooks) },
    { id: 'completion', label: 'Conclusao', value: formatPercent(metrics.completionPercent) },
    { id: 'pages-read', label: 'Paginas lidas', value: formatNumber(metrics.pagesRead) },
  ];
};
