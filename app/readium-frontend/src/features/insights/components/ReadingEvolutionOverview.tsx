import type { ReadingEvolutionSummary } from '../domain/reading-evolution';

interface ReadingEvolutionOverviewProps {
  summary: ReadingEvolutionSummary | null;
  isLoading: boolean;
}

const formatSigned = (value: number, suffix = ''): string => {
  if (value > 0) {
    return `+${value.toFixed(1)}${suffix}`;
  }
  if (value < 0) {
    return `${value.toFixed(1)}${suffix}`;
  }
  return `0${suffix}`;
};

const formatDeltaPages = (value: number): string => {
  if (value > 0) {
    return `+${Math.round(value)} paginas em 7 dias`;
  }
  return 'Sem aumento em 7 dias';
};

export const ReadingEvolutionOverview = ({
  summary,
  isLoading,
}: ReadingEvolutionOverviewProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-border/70 bg-card" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Paginas lidas</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{Math.round(summary.totalPagesRead)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatDeltaPages(summary.pagesDelta7)}</p>
      </article>

      <article className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Conclusao</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{Math.round(summary.completionPercent)}%</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatSigned(summary.completionDelta7, ' p.p. em 7 dias')}</p>
      </article>

      <article className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Media diaria (7d)</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{summary.avgPagesPerDay7.toFixed(1)}</p>
        <p className="mt-1 text-xs text-muted-foreground">paginas por dia</p>
      </article>

      <article className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Consistencia</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">
          {summary.activeDays14}/14
        </p>
        <p className="mt-1 text-xs text-muted-foreground">dias ativos | sequencia: {summary.streakDays}d</p>
      </article>
    </div>
  );
};
