import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface MortgageLayoutProps {
  isLoading: boolean;
  hasMortgage: boolean;
  emptyState: ReactNode;
  errorState?: ReactNode;
  isError?: boolean;
  children: ReactNode;
}

export function MortgageLayout({
  isLoading,
  hasMortgage,
  emptyState,
  errorState,
  isError,
  children,
}: MortgageLayoutProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError && errorState) {
    return <>{errorState}</>;
  }

  if (!hasMortgage) {
    return <>{emptyState}</>;
  }

  return <>{children}</>;
}
