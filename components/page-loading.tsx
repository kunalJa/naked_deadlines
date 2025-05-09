"use client"

import { createContext, useContext, useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Create a context to manage loading state globally
type LoadingContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

// Hook to use the loading context
export function useLoading() {
  return useContext(LoadingContext);
}

// Provider component for the loading context
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LoadingProviderInner>
        {children}
      </LoadingProviderInner>
    </Suspense>
  );
}

function LoadingProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to manually start loading
  const startLoading = () => {
    setManualLoading(true);
  };

  // Function to manually stop loading
  const stopLoading = () => {
    setManualLoading(false);
  };

  // Handle route changes
  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    // Set a timeout to hide the loading indicator after navigation completes
    const timeout = setTimeout(() => {
      setManualLoading(false);
    }, 500); // Delay to ensure the page has loaded
    
    setLoadingTimeout(timeout);
    
    // Clean up timeout on unmount
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [pathname, searchParams]);

  // Combine manual loading with route-based loading
  useEffect(() => {
    setIsLoading(manualLoading);
  }, [manualLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20">
          <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite] origin-left" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}

// Component for backward compatibility
export function PageLoading() {
  const { isLoading } = useLoading();
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20">
      <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite] origin-left" />
    </div>
  );
}
