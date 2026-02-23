import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { THEME_PRESETS } from '../theme/theme-presets';
import { useTheme } from '../theme/useTheme';

export const ThemePicker = () => {
  const { themeId, setThemeId } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Palette className="h-4 w-4" />
          <span>Tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
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
