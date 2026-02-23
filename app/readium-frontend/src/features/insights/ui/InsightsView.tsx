import type { FC } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout.tsx';
import { Button } from '@/components/ui/button.tsx';
import type {
  ReadingEvolutionContext,
  ReadingDailyProgressPoint,
  ReadingEvolutionSummary,
} from '../domain/reading-evolution';
import { ReadingEvolutionContextPanel } from '../components/ReadingEvolutionContextPanel';
import { ReadingEvolutionOverview } from '../components/ReadingEvolutionOverview';
import { ReadingEvolutionTimeline } from '../components/ReadingEvolutionTimeline';

interface InsightsViewProps {
  summary: ReadingEvolutionSummary | null;
  context: ReadingEvolutionContext;
  dailyProgress: ReadingDailyProgressPoint[];
  isLoading: boolean;
  isError: boolean;
  onOpenLibrary: () => void;
  onUploadClick: () => void;
}

export const InsightsView: FC<InsightsViewProps> = ({
  summary,
  context,
  dailyProgress,
  isLoading,
  isError,
  onOpenLibrary,
  onUploadClick,
}) => {
  const hasContent = Boolean(summary);

  return (
    <AppLayout onUploadClick={onUploadClick}>
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 animate-fade-in">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Insights</h1>
            <p className="text-muted-foreground">
              Acompanhe sua evolucao de leitura com foco em consistencia e progresso real.
            </p>
            {!isLoading ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                  {context.totalPages30} pags em 30 dias
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                  {context.activeDays30} dias ativos
                </span>
              </div>
            ) : null}
          </div>

          <Button variant="outline" className="w-full gap-2 md:w-auto" onClick={onOpenLibrary}>
            <BookOpen className="h-4 w-4" />
            Abrir biblioteca
          </Button>
        </header>

        {isError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Nao foi possivel carregar os dados agora.
          </div>
        ) : null}

        {!isLoading && !hasContent ? (
          <section className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-lg font-medium text-foreground">Sem historico suficiente</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Leia e atualize o progresso dos livros para acompanhar sua evolucao aqui.
            </p>
            <Button className="mt-4 gap-2" onClick={onOpenLibrary}>
              Ir para biblioteca
              <ArrowRight className="h-4 w-4" />
            </Button>
          </section>
        ) : (
          <section className="space-y-4">
            <ReadingEvolutionOverview summary={summary} isLoading={isLoading} />
            <div className="grid gap-4 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <ReadingEvolutionTimeline points={dailyProgress} isLoading={isLoading} />
              </div>
              <div className="xl:col-span-4">
                <ReadingEvolutionContextPanel context={context} isLoading={isLoading} />
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
};
