import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx"
import { AppSidebar } from "./AppSidebar.tsx"

interface AppLayoutProps {
  children: React.ReactNode;
  onUploadClick?: () => void;
}

export default function AppLayout({ children, onUploadClick }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar onUploadClick={onUploadClick} />
      <main className="flex min-h-screen w-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-50/80 to-background">
        <div className="flex items-center border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <SidebarTrigger className="rounded-md border border-slate-200 bg-white shadow-sm" />
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
