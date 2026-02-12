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
  variant?: 'default' | 'minimal' | 'badge';
  className?: string;
}

const statusConfig = {
  TO_READ: {
    label: BOOK_STATUS_LABEL.TO_READ,
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  READING: {
    label: BOOK_STATUS_LABEL.READING,
    icon: BookOpen,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  READ: {
    label: BOOK_STATUS_LABEL.READ,
    icon: CheckCircle2,
    color: 'text-green-500',
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
        {variant === 'badge' ? (
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
      <DropdownMenuContent align="end" className="w-40">
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
              className="gap-2 cursor-pointer"
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
