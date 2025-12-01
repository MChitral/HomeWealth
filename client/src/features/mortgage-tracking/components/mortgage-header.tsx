import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { PageHeader } from "@/shared/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { Mortgage } from "@shared/schema";
import { Download, Plus } from "lucide-react";
import type { ReactNode } from "react";

interface MortgageHeaderProps {
  mortgages: Mortgage[];
  selectedMortgageId: string | null;
  onSelectMortgage: (value: string | null) => void;
  onEditMortgage: () => void;
  onBackfillPayments: () => void;
  onLogPayment: () => void;
  onExport?: () => void;
  actionsExtra?: ReactNode;
  primeBanner?: ReactNode;
  canCreateTerm?: boolean;
  onOpenCreateMortgage?: () => void;
}

export function MortgageHeader({
  mortgages,
  selectedMortgageId,
  onSelectMortgage,
  onEditMortgage,
  onBackfillPayments,
  onLogPayment,
  onExport,
  actionsExtra,
  primeBanner,
  canCreateTerm = true,
  onOpenCreateMortgage,
}: MortgageHeaderProps) {
  const handleSelect = (value: string) => {
    onSelectMortgage(value || null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mortgage"
        description="Track your actual mortgage payments (Canadian term-based mortgages)"
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Mortgage</Label>
              <Select value={selectedMortgageId ?? ""} onValueChange={handleSelect}>
                <SelectTrigger className="w-[220px]" data-testid="select-mortgage">
                  <SelectValue placeholder="Select mortgage" />
                </SelectTrigger>
                <SelectContent>
                  {mortgages.map((mortgage) => (
                    <SelectItem key={mortgage.id} value={mortgage.id}>
                      {mortgage.propertyPrice
                        ? `$${Number(mortgage.propertyPrice).toLocaleString()}`
                        : "Mortgage"}{" "}
                      · Balance ${Number(mortgage.currentBalance).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" data-testid="button-export" onClick={onExport} disabled={!onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" data-testid="button-edit-mortgage" onClick={onEditMortgage}>
              Edit Details
            </Button>
            <Button
              variant="outline"
              data-testid="button-backfill-payments"
              onClick={onBackfillPayments}
              disabled={!canCreateTerm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Backfill Payments
            </Button>
            <Button data-testid="button-add-payment" onClick={onLogPayment} disabled={!canCreateTerm}>
              <Plus className="h-4 w-4 mr-2" />
              Log Payment
            </Button>
            {onOpenCreateMortgage && (
              <Button variant="ghost" onClick={onOpenCreateMortgage}>
                New Mortgage
              </Button>
            )}
            {actionsExtra}
          </div>
        }
      />
      {primeBanner}
    </div>
  );
}
