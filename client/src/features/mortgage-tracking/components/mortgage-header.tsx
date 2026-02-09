import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import type { Mortgage } from "@shared/schema";
import { Download, Plus, Pencil, History, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { MortgageSelector } from "./mortgage-selector";

interface MortgageHeaderProps {
  mortgages: Mortgage[];
  selectedMortgageId: string | null;
  onSelectMortgage: (value: string | null) => void;
  onEditMortgage: () => void;
  onBackfillPayments: () => void;
  onLogPayment: () => void;
  onDeleteMortgage?: () => void;
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
  onDeleteMortgage,
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
    <div className="space-y-6">
      <PageHeader
        title="Mortgage Tracking"
        description="Track your actual mortgage payments with Canadian term-based calculations"
      />

      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="lg:w-[340px] flex-shrink-0">
          <MortgageSelector
            mortgages={mortgages}
            selectedMortgageId={selectedMortgageId}
            onSelectMortgage={handleSelect}
            onCreateNew={onOpenCreateMortgage ?? (() => {})}
          />
        </div>

        {mortgages.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Button
              data-testid="button-add-payment"
              onClick={onLogPayment}
              disabled={!canCreateTerm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Payment
            </Button>

            <Button
              variant="outline"
              data-testid="button-backfill-payments"
              onClick={onBackfillPayments}
              disabled={!canCreateTerm}
            >
              <History className="h-4 w-4 mr-2" />
              Backfill
            </Button>

            <Button variant="outline" data-testid="button-edit-mortgage" onClick={onEditMortgage}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button
              variant="ghost"
              data-testid="button-export"
              onClick={onExport}
              disabled={!onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="ghost"
              data-testid="button-delete-mortgage"
              onClick={onDeleteMortgage}
              disabled={!onDeleteMortgage}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            {actionsExtra}
          </div>
        )}
      </div>

      {primeBanner}
    </div>
  );
}
