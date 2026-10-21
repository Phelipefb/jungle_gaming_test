import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { queryClient } from "./query-client";
import { RealtimeQuerySync } from "./realtime-query-sync";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeQuerySync />
      {children}
    </QueryClientProvider>
  );
}
