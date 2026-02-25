import React from 'react';
import { BookStatus } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { BookOpen, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { BOOK_STATUS_LABEL } from '../domain/status-metadata';

interface StatusSelectorProps {
  status: BookStatus;
  onChange: (status: BookStatus) => void;
  variant?: 'default' | 'minimal' | 'badge' | 'dot';
  className?: string;
}

const statusConfig = {
  TO_READ: {
    label: BOOK_STATUS_LABEL.TO_READ,
    icon: Clock,
    color: 'text-red-500',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  READING: {
    label: BOOK_STATUS_LABEL.READING,
    icon: BookOpen,
    color: 'text-amber-500',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  READ: {
    label: BOOK_STATUS_LABEL.READ,
    icon: CheckCircle2,
    color: 'text-green-500',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
};

export default function StatusSelector({ status, onChange, variant = 'default', className }: StatusSelectorProps) {
  const current = statusConfig[status];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'dot' ? (
          <button
            type="button"
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:h-5 sm:w-5",
              className
            )}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Alterar status: ${current.label}`}
            title={current.label}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-white/90 shadow-sm", current.dotColor)} />
          </button>
        ) : variant === 'badge' ? (
          <button
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors hover:bg-opacity-80 outline-none ring-0 focus:ring-0 focus:outline-none",
              current.color,
              current.bgColor,
              current.borderColor,
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className="w-3 h-3" />
            {current.label}
          </button>
        ) : variant === 'minimal' ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8 gap-2 outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0", className)}
          >
            <Icon className={cn("w-4 h-4", current.color)} />
            <span className="hidden sm:inline">{current.label}</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className={cn("gap-2 outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0", className)}
          >
            <Icon className={cn("w-4 h-4", current.color)} />
            {current.label}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(15rem,calc(100vw-2rem))]">
        {(Object.keys(statusConfig) as BookStatus[]).map((s) => {
          const config = statusConfig[s];
          const ItemIcon = config.icon;
          return (
            <DropdownMenuItem
              key={s}
              onClick={(e) => {
                e.stopPropagation();
                onChange(s);
              }}
              className="gap-2"
            >
              <ItemIcon className={cn("w-4 h-4", config.color)} />
              <span>{config.label}</span>
              {status === s && <CheckCircle2 className="w-3 h-3 ml-auto opacity-50" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
