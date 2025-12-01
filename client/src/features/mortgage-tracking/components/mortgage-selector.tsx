import { Card } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import type { Mortgage } from "@shared/schema";
import { ChevronDown, Home, Plus, Check } from "lucide-react";

interface MortgageSelectorProps {
  mortgages: Mortgage[];
  selectedMortgageId: string | null;
  onSelectMortgage: (id: string) => void;
  onCreateNew: () => void;
}

export function MortgageSelector({
  mortgages,
  selectedMortgageId,
  onSelectMortgage,
  onCreateNew,
}: MortgageSelectorProps) {
  const selectedMortgage = mortgages.find((m) => m.id === selectedMortgageId);

  if (mortgages.length === 0) {
    return (
      <Card 
        className="p-4 border-dashed border-2 hover-elevate cursor-pointer" 
        onClick={onCreateNew}
        data-testid="button-create-first-mortgage"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Add Your First Mortgage</p>
            <p className="text-sm text-muted-foreground">Start tracking your Canadian mortgage</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Card 
          className="p-3 cursor-pointer hover-elevate"
          data-testid="mortgage-selector-trigger"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg font-mono">
                    ${Number(selectedMortgage?.currentBalance || 0).toLocaleString()}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Balance
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedMortgage?.propertyPrice
                    ? `$${Number(selectedMortgage.propertyPrice).toLocaleString()} property`
                    : "Mortgage"}
                  {mortgages.length > 1 && (
                    <span className="ml-2 text-xs">
                      ({mortgages.length} mortgages)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </Card>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[320px]">
        {mortgages.map((mortgage) => (
          <DropdownMenuItem
            key={mortgage.id}
            onClick={() => onSelectMortgage(mortgage.id)}
            className="flex items-center justify-between py-3 cursor-pointer"
            data-testid={`mortgage-option-${mortgage.id}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium font-mono">
                  ${Number(mortgage.currentBalance).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mortgage.propertyPrice
                    ? `$${Number(mortgage.propertyPrice).toLocaleString()} property`
                    : "Mortgage"}
                </p>
              </div>
            </div>
            {mortgage.id === selectedMortgageId && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onCreateNew}
          className="py-3 cursor-pointer"
          data-testid="button-add-new-mortgage"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary">Add New Mortgage</p>
              <p className="text-xs text-muted-foreground">Track another property</p>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
