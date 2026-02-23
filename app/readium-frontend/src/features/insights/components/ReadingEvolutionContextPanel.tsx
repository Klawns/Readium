import type { ReadingEvolutionContext } from '../domain/reading-evolution';

interface ReadingEvolutionContextPanelProps {
  context: ReadingEvolutionContext;
  isLoading: boolean;
}

const ContextSkeleton = () => (
  <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
    ))}
  </div>
);

const StatItem = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <article className="rounded-lg border border-border/70 bg-background p-3">
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
  </article>
);

export const ReadingEvolutionContextPanel = ({
  context,
  isLoading,
}: ReadingEvolutionContextPanelProps) => {
  if (isLoading) {
    return <ContextSkeleton />;
  }

  return (
    <aside className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Resumo de 30 dias</h3>

      <StatItem
        label="Consistencia"
        value={`${context.activeDays30}/30`}
        helper="dias com leitura registrada"
      />
      <StatItem
        label="Melhor dia"
        value={context.bestDayPages > 0 ? `${context.bestDayPages} pags` : '-'}
        helper={context.bestDayPages > 0 ? context.bestDayLabel : 'sem leitura registrada'}
      />
      <StatItem
        label="Livros tocados"
        value={String(context.totalBooksTouched30)}
        helper="interacoes unicas por dia somadas"
      />
      <StatItem
        label="Atualizacoes"
        value={String(context.totalProgressUpdates30)}
        helper={`${context.totalPages30} paginas acumuladas`}
      />
    </aside>
  );
};

