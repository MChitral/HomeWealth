import { Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { useEmergencyFundData, useEmergencyFundCalculations, useEmergencyFundState } from "./hooks";
import { useCashFlowData } from "@/features/cash-flow/hooks";
import {
  EmergencyFundTargetCard,
  EmergencyFundCalculatorCard,
  EmergencyFundEducation,
} from "./components";

export default function EmergencyFundFeature() {
  const { emergencyFund, isLoading: emergencyFundLoading } = useEmergencyFundData();
  const { cashFlow, isLoading: cashFlowLoading } = useCashFlowData();

  usePageTitle("Emergency Fund | Mortgage Strategy");

  const {
    targetMonths,
    setTargetMonths,
    currentBalance,
    setCurrentBalance,
    monthlyContribution,
    setMonthlyContribution,
    handleSave,
    saveMutation,
  } = useEmergencyFundState({ emergencyFund });

  const {
    fixedExpenses,
    variableExpenses,
    monthlyExpenses,
    hasExpenseData,
    targetAmount,
    currentBalanceValue,
    progressPercent,
  } = useEmergencyFundCalculations({
    cashFlow,
    targetMonths,
    currentBalance,
  });

  const isLoading = emergencyFundLoading || cashFlowLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Fund Settings"
        description="Set your emergency fund target (applies to all scenarios)"
        sticky
        actions={
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <EmergencyFundTargetCard
        targetMonths={targetMonths}
        setTargetMonths={setTargetMonths}
        currentBalance={currentBalance}
        setCurrentBalance={setCurrentBalance}
        monthlyContribution={monthlyContribution}
        setMonthlyContribution={setMonthlyContribution}
        targetAmount={targetAmount}
        monthlyExpenses={monthlyExpenses}
        hasExpenseData={hasExpenseData}
        currentBalanceValue={currentBalanceValue}
        progressPercent={progressPercent}
      />

      <EmergencyFundCalculatorCard
        fixedExpenses={fixedExpenses}
        variableExpenses={variableExpenses}
        monthlyExpenses={monthlyExpenses}
        hasExpenseData={hasExpenseData}
        onSetTargetMonths={(months) => setTargetMonths(months.toString())}
      />

      <EmergencyFundEducation />
    </div>
  );
}
