import type { ReadingDailyProgressPoint } from '../domain/reading-evolution';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ReadingEvolutionTimelineProps {
  points: ReadingDailyProgressPoint[];
  isLoading: boolean;
}

export const ReadingEvolutionTimeline = ({ points, isLoading }: ReadingEvolutionTimelineProps) => {
  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-xl border border-border/70 bg-card" />;
  }

  const totalPages = points.reduce((total, point) => total + point.pagesRead, 0);
  const totalBooksTouched = points.reduce((total, point) => total + point.booksTouched, 0);

  const tooltipFormatter = (value: number, name: string): [string, string] => {
    if (name === 'pagesRead') {
      return [`${Math.round(value)} paginas`, 'Paginas lidas'];
    }
    if (name === 'booksTouched') {
      return [`${Math.round(value)} livros`, 'Livros tocados'];
    }
    return [`${Math.round(value)}`, name];
  };

  return (
    <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evolucao diaria</h2>
          <p className="text-xs text-muted-foreground">Ultimos 30 dias</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {Math.round(totalPages)} paginas
          </span>
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {Math.round(totalBooksTouched)} livros tocados
          </span>
        </div>
      </header>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="readingArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={34}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              allowDecimals={false}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(label) => `Dia ${label}`}
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.35 }}
              contentStyle={{
                borderRadius: '10px',
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'hsl(var(--background))',
              }}
            />
            <Area
              type="monotone"
              dataKey="pagesRead"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#readingArea)"
              strokeWidth={2}
              isAnimationActive={false}
              name="pagesRead"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
