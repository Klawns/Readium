import type { BookMetrics } from '@/types';

const numberFormatter = new Intl.NumberFormat('pt-BR');

export const formatNumber = (value: number): string => numberFormatter.format(value);

export const formatPercent = (value: number): string => `${Math.max(0, Math.min(100, Math.round(value)))}%`;

export interface MetricTile {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export const buildMetricTiles = (metrics: BookMetrics): MetricTile[] => [
  {
    id: 'total-books',
    label: 'Livros',
    value: formatNumber(metrics.totalBooks),
    hint: 'Total na biblioteca',
  },
  {
    id: 'completion',
    label: 'Conclusao',
    value: formatPercent(metrics.completionPercent),
    hint: 'Livros concluidos',
  },
  {
    id: 'avg-progress',
    label: 'Progresso medio',
    value: formatPercent(metrics.averageProgressPercent),
    hint: 'Entre livros com paginas conhecidas',
  },
  {
    id: 'pages-read',
    label: 'Paginas lidas',
    value: formatNumber(metrics.pagesRead),
    hint: `de ${formatNumber(metrics.totalPagesKnown)} paginas mapeadas`,
  },
  {
    id: 'uncategorized',
    label: 'Sem categoria',
    value: formatNumber(metrics.uncategorizedBooks),
    hint: 'Livros para organizar',
  },
];

