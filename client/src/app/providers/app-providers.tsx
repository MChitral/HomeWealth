import { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { MortgageSelectionProvider } from "@/shared/contexts/mortgage-selection-context";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MortgageSelectionProvider>{children}</MortgageSelectionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

