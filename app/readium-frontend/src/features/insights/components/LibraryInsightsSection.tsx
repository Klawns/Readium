import type { FC } from 'react';
import type { BookMetrics, BookRecommendation, SmartCollection } from '@/types';
import { PersonalMetricsPanel } from './PersonalMetricsPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import { SmartCollectionsPanel } from './SmartCollectionsPanel';

interface LibraryInsightsSectionProps {
  metrics?: BookMetrics;
  smartCollections: SmartCollection[];
  recommendations: BookRecommendation[];
  isLoading: boolean;
  isError: boolean;
  onOpenBook: (bookId: number) => void;
}

export const LibraryInsightsSection: FC<LibraryInsightsSectionProps> = ({
  metrics,
  smartCollections,
  recommendations,
  isLoading,
  isError,
  onOpenBook,
}) => {
  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Nao foi possivel carregar insights agora. Tente novamente em instantes.
      </div>
    );
  }

  if (!isLoading && !metrics && smartCollections.length === 0 && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
      <PersonalMetricsPanel metrics={metrics} isLoading={isLoading} />
      <SmartCollectionsPanel collections={smartCollections} isLoading={isLoading} onOpenBook={onOpenBook} />
      <RecommendationsPanel recommendations={recommendations} isLoading={isLoading} onOpenBook={onOpenBook} />
    </section>
  );
};

