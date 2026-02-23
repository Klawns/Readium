import type { FC } from 'react';
import type { BookMetrics } from '@/types';
import { buildMetricTiles } from '../application/services/insight-formatters';

interface PersonalMetricsPanelProps {
  metrics?: BookMetrics;
  isLoading: boolean;
}

export const PersonalMetricsPanel: FC<PersonalMetricsPanelProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const tiles = buildMetricTiles(metrics);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {tiles.map((tile) => (
        <article
          key={tile.id}
          className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">{tile.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{tile.value}</p>
          <p className="mt-2 text-xs text-slate-500">{tile.hint}</p>
        </article>
      ))}
    </div>
  );
};

