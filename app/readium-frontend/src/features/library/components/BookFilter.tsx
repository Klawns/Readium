import type { StatusFilter } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { LIBRARY_FILTER_OPTIONS } from '../domain/status-metadata';

interface BookFilterProps {
  active: StatusFilter;
  onChange: (filter: StatusFilter) => void;
}

export default function BookFilter({ active, onChange }: BookFilterProps) {
  return (
    <Tabs value={active} onValueChange={(v) => onChange(v as StatusFilter)}>
      <TabsList>
        {LIBRARY_FILTER_OPTIONS.map((f) => (
          <TabsTrigger key={f.value} value={f.value}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
