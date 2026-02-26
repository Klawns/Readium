import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./features/preferences/theme/ThemeProvider.tsx";
import { useOfflineSyncBootstrap } from "./features/offline/ui/hooks/useOfflineSyncBootstrap.ts";
import { NetworkStatusBanner } from "./features/offline/ui/components/NetworkStatusBanner.tsx";

const LibraryPage = lazy(() => import("./pages/LibraryPage.tsx"));
const InsightsPage = lazy(() => import("./pages/InsightsPage.tsx"));
const CollectionFoldersPage = lazy(() => import("./pages/CollectionFoldersPage.tsx"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage.tsx"));
const OfflineDownloadsPage = lazy(() => import("./pages/OfflineDownloadsPage.tsx"));
const ReaderPage = lazy(() => import("./pages/ReaderPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

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
          <Suspense fallback={<PageLoadingFallback />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const PageLoadingFallback = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-background">
    <span className="text-sm text-muted-foreground">Carregando pagina...</span>
  </div>
);

export default App;
