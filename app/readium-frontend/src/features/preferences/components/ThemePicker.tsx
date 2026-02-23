import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { cn } from '@/lib/utils.ts';
import { THEME_PRESETS } from '../theme/theme-presets';
import { useTheme } from '../theme/useTheme';

interface ThemePickerProps {
  buttonClassName?: string;
  labelClassName?: string;
  align?: 'start' | 'center' | 'end';
}

export const ThemePicker = ({ buttonClassName, labelClassName, align = 'start' }: ThemePickerProps) => {
  const { themeId, setThemeId } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('w-full justify-start gap-2', buttonClassName)}>
          <Palette className="h-4 w-4" />
          <span className={labelClassName}>Tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {THEME_PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => setThemeId(preset.id)}
            className="flex items-center justify-between"
          >
            <span>{preset.name}</span>
            {preset.id === themeId ? <span className="text-xs text-muted-foreground">Ativo</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
