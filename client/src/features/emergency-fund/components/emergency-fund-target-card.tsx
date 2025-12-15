import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { Shield } from "lucide-react";
import { EmergencyFundProgress } from "./emergency-fund-progress";

interface EmergencyFundTargetCardProps {
  targetMonths: string;
  setTargetMonths: (value: string) => void;
  currentBalance: string;
  setCurrentBalance: (value: string) => void;
  monthlyContribution: string;
  setMonthlyContribution: (value: string) => void;
  targetAmount: number;
  monthlyExpenses: number;
  hasExpenseData: boolean;
  currentBalanceValue: number;
  progressPercent: number;
}

export function EmergencyFundTargetCard({
  targetMonths,
  setTargetMonths,
  currentBalance,
  setCurrentBalance,
  monthlyContribution,
  setMonthlyContribution,
  targetAmount,
  monthlyExpenses,
  hasExpenseData,
  currentBalanceValue,
  progressPercent,
}: EmergencyFundTargetCardProps) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Emergency Fund Target</CardTitle>
        </div>
        <CardDescription>
          Your financial safety net in case of job loss or emergencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-primary/10 rounded-md">
          <p className="text-sm font-medium mb-2">What is an Emergency Fund?</p>
          <p className="text-sm text-muted-foreground">
            An emergency fund is cash set aside to cover unexpected expenses or income loss.
            Financial experts recommend 3-6 months of living expenses for most people, or 6-12
            months if you're self-employed or have variable income.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-months">Target Coverage (Months)</Label>
              <Input
                id="target-months"
                type="number"
                min="1"
                max="12"
                step="0.1"
                value={targetMonths}
                onChange={(event) => setTargetMonths(event.target.value)}
                data-testid="input-target-months"
              />
              <p className="text-sm text-muted-foreground">Months of expenses to cover</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-balance">Current Balance</Label>
              <Input
                id="current-balance"
                type="number"
                min="0"
                step="0.01"
                value={currentBalance}
                onChange={(event) => setCurrentBalance(event.target.value)}
                data-testid="input-current-balance"
              />
              <p className="text-sm text-muted-foreground">How much you have saved now</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
            <Input
              id="monthly-contribution"
              type="number"
              min="0"
              step="0.01"
              value={monthlyContribution}
              onChange={(event) => setMonthlyContribution(event.target.value)}
              data-testid="input-monthly-contribution"
            />
            <p className="text-sm text-muted-foreground">
              How much you'll add each month until target is reached
            </p>
          </div>

          <Separator />

          <EmergencyFundProgress
            targetAmount={targetAmount}
            targetMonths={targetMonths}
            monthlyExpenses={monthlyExpenses}
            hasExpenseData={hasExpenseData}
            currentBalanceValue={currentBalanceValue}
            progressPercent={progressPercent}
          />
        </div>
      </CardContent>
    </Card>
  );
}
