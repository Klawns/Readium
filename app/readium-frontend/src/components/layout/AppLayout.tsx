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
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
        <div className="flex items-center p-4 lg:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
