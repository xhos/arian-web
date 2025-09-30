"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache transactions for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep in background cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests
            retry: 3,
            // Refetch on window focus for fresh data
            refetchOnWindowFocus: true,
            // Enable deduplication for same queries
            refetchOnMount: "stale",
            refetchOnReconnect: "stale",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
