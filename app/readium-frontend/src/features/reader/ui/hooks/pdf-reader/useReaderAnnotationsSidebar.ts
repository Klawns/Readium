import { useCallback, useEffect, useState } from 'react';

interface UseReaderAnnotationsSidebarParams {
  fileUrl: string;
  isMobile: boolean;
  goToPage: (page: number) => void;
}

export const useReaderAnnotationsSidebar = ({
  fileUrl,
  isMobile,
  goToPage,
}: UseReaderAnnotationsSidebarParams) => {
  const [isAnnotationsSidebarOpen, setIsAnnotationsSidebarOpen] = useState(false);

  const handleGoToAnnotationPage = useCallback(
    (page: number) => {
      goToPage(page);
      if (isMobile) {
        setIsAnnotationsSidebarOpen(false);
      }
    },
    [goToPage, isMobile],
  );

  useEffect(() => {
    setIsAnnotationsSidebarOpen(false);
  }, [fileUrl]);

  return {
    isAnnotationsSidebarOpen,
    setIsAnnotationsSidebarOpen,
    handleGoToAnnotationPage,
  };
};
