import { Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import { QueryErrorState } from "@/shared/components";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { useEmergencyFundData, useEmergencyFundCalculations, useEmergencyFundState } from "./hooks";
import { useCashFlowData } from "@/features/cash-flow/hooks";
import {
  EmergencyFundTargetCard,
  EmergencyFundCalculatorCard,
  EmergencyFundEducation,
} from "./components";

export default function EmergencyFundFeature() {
  const {
    emergencyFund,
    isLoading: emergencyFundLoading,
    isError: emergencyFundError,
    refetch: refetchEmergencyFund,
  } = useEmergencyFundData();
  const {
    cashFlow,
    isLoading: cashFlowLoading,
    isError: cashFlowError,
    refetch: refetchCashFlow,
  } = useCashFlowData();

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
  const isError = emergencyFundError || cashFlowError;

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

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Emergency Fund Settings"
          description="Set your emergency fund target (applies to all scenarios)"
        />
        <QueryErrorState
          onRetry={() => {
            refetchEmergencyFund();
            refetchCashFlow();
          }}
        />
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
