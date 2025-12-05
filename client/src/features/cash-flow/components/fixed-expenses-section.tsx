import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { TrendingDown } from "lucide-react";

interface FixedExpensesSectionProps {
  propertyTax: number;
  setPropertyTax: (value: number) => void;
  insurance: number;
  setInsurance: (value: number) => void;
  condoFees: number;
  setCondoFees: (value: number) => void;
  utilities: number;
  setUtilities: (value: number) => void;
  fixedHousingCosts: number;
}

export function FixedExpensesSection({
  propertyTax,
  setPropertyTax,
  insurance,
  setInsurance,
  condoFees,
  setCondoFees,
  utilities,
  setUtilities,
  fixedHousingCosts,
}: FixedExpensesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          <CardTitle>Fixed Expenses</CardTitle>
        </div>
        <CardDescription>Expenses that stay relatively constant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property-tax">Property Tax (monthly)</Label>
            <Input
              id="property-tax"
              type="number"
              placeholder="400"
              value={propertyTax}
              onChange={(event) => setPropertyTax(Number(event.target.value) || 0)}
              data-testid="input-property-tax"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance">Home Insurance (monthly)</Label>
            <Input
              id="insurance"
              type="number"
              placeholder="150"
              value={insurance}
              onChange={(event) => setInsurance(Number(event.target.value) || 0)}
              data-testid="input-insurance"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condo-fees">Condo Fees / Maintenance</Label>
            <Input
              id="condo-fees"
              type="number"
              placeholder="300"
              value={condoFees}
              onChange={(event) => setCondoFees(Number(event.target.value) || 0)}
              data-testid="input-condo-fees"
            />
            <p className="text-sm text-muted-foreground">Leave blank if N/A</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="utilities">Utilities (monthly avg)</Label>
            <Input
              id="utilities"
              type="number"
              placeholder="200"
              value={utilities}
              onChange={(event) => setUtilities(Number(event.target.value) || 0)}
              data-testid="input-utilities"
            />
            <p className="text-sm text-muted-foreground">Gas, electric, water, internet</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="total-fixed">Total Fixed Housing Costs</Label>
          <div className="p-4 bg-muted/50 rounded-md">
            <p className="text-2xl font-mono font-bold">${fixedHousingCosts.toLocaleString()}/month</p>
            <p className="text-sm text-muted-foreground mt-1">Excluding mortgage payment</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

