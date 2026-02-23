import { useNavigate } from 'react-router-dom';
import { useReadingEvolutionInsights } from '@/features/insights/ui/hooks/useReadingEvolutionInsights.ts';
import { InsightsView } from '@/features/insights/ui/InsightsView.tsx';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { summary, context, dailyProgress, isLoading, isError } = useReadingEvolutionInsights();

  return (
    <InsightsView
      summary={summary}
      context={context}
      dailyProgress={dailyProgress}
      isLoading={isLoading}
      isError={isError}
      onOpenLibrary={() => navigate('/books')}
      onUploadClick={() => navigate('/books')}
    />
  );
}
