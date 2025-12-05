import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Briefcase } from "lucide-react";

interface IncomeSectionProps {
  monthlyIncome: number;
  setMonthlyIncome: (value: number) => void;
  extraPaycheques: number;
  setExtraPaycheques: (value: number) => void;
  annualBonus: number;
  setAnnualBonus: (value: number) => void;
}

export function IncomeSection({
  monthlyIncome,
  setMonthlyIncome,
  extraPaycheques,
  setExtraPaycheques,
  annualBonus,
  setAnnualBonus,
}: IncomeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle>Income</CardTitle>
        </div>
        <CardDescription>Your regular income sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-income">Monthly Income (base)</Label>
            <Input
              id="monthly-income"
              type="number"
              placeholder="8000"
              value={monthlyIncome}
              onChange={(event) => setMonthlyIncome(Number(event.target.value) || 0)}
              data-testid="input-monthly-income"
            />
            <p className="text-sm text-muted-foreground">Regular bi-weekly paycheques (2 per month)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="extra-paycheques">Extra Paycheques/Year</Label>
            <Input
              id="extra-paycheques"
              type="number"
              placeholder="2"
              value={extraPaycheques}
              onChange={(event) => setExtraPaycheques(Number(event.target.value) || 0)}
              data-testid="input-extra-paycheques"
            />
            <p className="text-sm text-muted-foreground">Typical for bi-weekly pay (26 weeks = 2 extra)</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="annual-bonus">Annual Bonus</Label>
          <Input
            id="annual-bonus"
            type="number"
            placeholder="10000"
            value={annualBonus}
            onChange={(event) => setAnnualBonus(Number(event.target.value) || 0)}
            data-testid="input-annual-bonus"
          />
          <p className="text-sm text-muted-foreground">Pre-tax annual bonus amount</p>
        </div>
      </CardContent>
    </Card>
  );
}

