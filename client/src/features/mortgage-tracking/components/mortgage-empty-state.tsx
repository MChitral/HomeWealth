import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Info } from "lucide-react";

interface MortgageEmptyStateProps {
  onOpenCreateMortgage: () => void;
}

export function MortgageEmptyState({ onOpenCreateMortgage }: MortgageEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-8">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Info className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center max-w-md space-y-2">
        <h2 className="text-2xl font-semibold">Welcome to Mortgage Tracking</h2>
        <p className="text-muted-foreground">
          Track your Canadian mortgage with term-by-term history, payment breakdowns (principal vs interest),
          and renewal management. Get started by creating your first mortgage.
        </p>
      </div>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg">What you'll track:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              title: "Payment History",
              description: "Principal, interest, and remaining balance per payment",
            },
            {
              title: "Term Management",
              description: "Track fixed vs variable terms with Canadian semi-annual compounding",
            },
            {
              title: "Renewal Tracking",
              description: "Simulate term renewals with new rates and payment schedules",
            },
          ].map((item, index) => (
            <div className="flex gap-3" key={item.title}>
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button size="lg" data-testid="button-create-mortgage" onClick={onOpenCreateMortgage}>
        Create Your First Mortgage
      </Button>
    </div>
  );
}

