interface EmergencyFundProgressProps {
  targetAmount: number;
  targetMonths: string;
  monthlyExpenses: number;
  hasExpenseData: boolean;
  currentBalanceValue: number;
  progressPercent: number;
}

export function EmergencyFundProgress({
  targetAmount,
  targetMonths,
  monthlyExpenses,
  hasExpenseData,
  currentBalanceValue,
  progressPercent,
}: EmergencyFundProgressProps) {
  return (
    <div className="p-4 bg-muted/50 rounded-md">
      <p className="text-sm text-muted-foreground mb-1">Your Target Emergency Fund</p>
      {hasExpenseData ? (
        <>
          <p className="text-3xl font-mono font-bold mb-2" data-testid="text-target-amount">
            ${targetAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-muted-foreground">
            = {targetMonths} months × ${monthlyExpenses.toLocaleString()}/month
          </p>
          {currentBalanceValue > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-lg font-mono font-semibold">{progressPercent.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">
                ${currentBalanceValue.toLocaleString()} of ${targetAmount.toLocaleString()}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">No expense data available</p>
          <p>
            Please fill out your <a href="/cash-flow" className="text-primary underline">Cash Flow</a> page first to
            calculate recommended targets.
          </p>
        </div>
      )}
    </div>
  );
}

