import { BarChart3, BookOpen, FolderKanban, Library, Upload } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx"
import { Link, useLocation } from "react-router-dom"
import { SidebarSettings } from "./SidebarSettings.tsx"

interface AppSidebarProps {
  onUploadClick?: () => void
}

export function AppSidebar({ onUploadClick }: AppSidebarProps) {
  const location = useLocation()
  const isLibraryActive = location.pathname === '/books' || /^\/books\/\d+$/.test(location.pathname)
  const isInsightsActive = location.pathname === '/books/insights'
  const isCollectionsActive = location.pathname === '/books/collections' || location.pathname === '/books/folders'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-14 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Readium</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLibraryActive} tooltip="Biblioteca">
                  <Link to="/books">
                    <Library />
                    <span>Biblioteca</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isInsightsActive} tooltip="Insights">
                  <Link to="/books/insights">
                    <BarChart3 />
                    <span>Insights</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isCollectionsActive} tooltip="Colecoes">
                  <Link to="/books/collections">
                    <FolderKanban />
                    <span>Colecoes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onUploadClick} tooltip="Upload">
                  <Upload />
                  <span>Upload</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSettings />
    </Sidebar>
  )
}
