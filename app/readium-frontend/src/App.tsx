import { Toaster } from "@/components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LibraryPage from "./pages/LibraryPage.tsx";
import InsightsPage from "./pages/InsightsPage.tsx";
import CollectionFoldersPage from "./pages/CollectionFoldersPage.tsx";
import CategoriesPage from "./pages/CategoriesPage.tsx";
import OfflineDownloadsPage from "./pages/OfflineDownloadsPage.tsx";
import ReaderPage from "./pages/ReaderPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ThemeProvider } from "./features/preferences/theme/ThemeProvider.tsx";
import { useOfflineSyncBootstrap } from "./features/offline/ui/hooks/useOfflineSyncBootstrap.ts";
import { NetworkStatusBanner } from "./features/offline/ui/components/NetworkStatusBanner.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppShell />
  </QueryClientProvider>
);

const AppShell = () => {
  useOfflineSyncBootstrap();

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NetworkStatusBanner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/books" replace />} />
            <Route path="/books" element={<LibraryPage />} />
            <Route path="/books/insights" element={<InsightsPage />} />
            <Route path="/books/collections" element={<CollectionFoldersPage />} />
            <Route path="/books/folders" element={<Navigate to="/books/collections" replace />} />
            <Route path="/books/categories" element={<CategoriesPage />} />
            <Route path="/books/downloads" element={<OfflineDownloadsPage />} />
            <Route path="/books/:id" element={<ReaderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
