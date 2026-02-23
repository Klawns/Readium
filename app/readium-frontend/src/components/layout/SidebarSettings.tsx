import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar.tsx';
import { cn } from '@/lib/utils.ts';
import { ThemePicker } from '@/features/preferences/components/ThemePicker.tsx';

export const SidebarSettings = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SidebarFooter className="border-t border-sidebar-border/70 pt-2">
      <div className="rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 p-1">
        <div
          className={cn(
            'overflow-hidden px-1 transition-all duration-300 ease-out',
            isExpanded ? 'max-h-16 translate-y-0 pb-1 opacity-100' : 'max-h-0 -translate-y-2 pb-0 opacity-0',
          )}
        >
          <ThemePicker
            buttonClassName="h-8 rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
            labelClassName="group-data-[collapsible=icon]:hidden"
            align="end"
          />
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Configuracoes"
              onClick={() => setIsExpanded((current) => !current)}
              isActive={isExpanded}
            >
              <Settings2 className={cn('transition-transform duration-200', isExpanded ? 'rotate-90' : 'rotate-0')} />
              <span>Configuracoes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </SidebarFooter>
  );
};
