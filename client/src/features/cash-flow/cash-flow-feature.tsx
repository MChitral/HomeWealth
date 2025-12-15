import { Save, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Form } from "@/shared/ui/form";
import { useCashFlowData, useCashFlowFormState, useCashFlowCalculations } from "./hooks";
import {
  IncomeSection,
  FixedExpensesSection,
  VariableExpensesSection,
  DebtSection,
  SummarySection,
} from "./components";

export default function CashFlowFeature() {
  const { cashFlow, isLoading } = useCashFlowData();

  usePageTitle("Cash Flow Settings | Mortgage Strategy");

  const {
    monthlyIncome,
    setMonthlyIncome,
    extraPaycheques,
    setExtraPaycheques,
    annualBonus,
    setAnnualBonus,
    propertyTax,
    setPropertyTax,
    insurance,
    setInsurance,
    condoFees,
    setCondoFees,
    utilities,
    setUtilities,
    groceries,
    setGroceries,
    dining,
    setDining,
    transportation,
    setTransportation,
    entertainment,
    setEntertainment,
    carLoan,
    setCarLoan,
    studentLoan,
    setStudentLoan,
    creditCard,
    setCreditCard,
    handleSave,
    saveMutation,
    form,
  } = useCashFlowFormState({ cashFlow });

  const {
    extraPaychequesMonthly,
    annualBonusMonthly,
    totalMonthlyIncome,
    fixedHousingCosts,
    variableExpenses,
    otherDebtPayments,
    totalMonthlyExpenses,
    monthlySurplus,
    runwayMonths,
    mortgagePayment,
  } = useCashFlowCalculations({
    monthlyIncome,
    extraPaycheques,
    annualBonus,
    propertyTax,
    insurance,
    condoFees,
    utilities,
    groceries,
    dining,
    transportation,
    entertainment,
    carLoan,
    studentLoan,
    creditCard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(4)].map((_value, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <PageHeader
          title="Cash Flow Settings"
          description="Configure your income and expenses (applies to all scenarios)"
          actions={
            <Button
              data-testid="button-save"
              onClick={handleSave}
              disabled={saveMutation.isPending || isLoading}
              className="sticky top-4 z-10"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          }
        />

        <IncomeSection
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
          extraPaycheques={extraPaycheques}
          setExtraPaycheques={setExtraPaycheques}
          annualBonus={annualBonus}
          setAnnualBonus={setAnnualBonus}
        />

        <FixedExpensesSection
          propertyTax={propertyTax}
          setPropertyTax={setPropertyTax}
          insurance={insurance}
          setInsurance={setInsurance}
          condoFees={condoFees}
          setCondoFees={setCondoFees}
          utilities={utilities}
          setUtilities={setUtilities}
          fixedHousingCosts={fixedHousingCosts}
        />

        <VariableExpensesSection
          groceries={groceries}
          setGroceries={setGroceries}
          dining={dining}
          setDining={setDining}
          transportation={transportation}
          setTransportation={setTransportation}
          entertainment={entertainment}
          setEntertainment={setEntertainment}
          variableExpenses={variableExpenses}
        />

        <DebtSection
          carLoan={carLoan}
          setCarLoan={setCarLoan}
          studentLoan={studentLoan}
          setStudentLoan={setStudentLoan}
          creditCard={creditCard}
          setCreditCard={setCreditCard}
          otherDebtPayments={otherDebtPayments}
        />

        <SummarySection
          monthlyIncome={monthlyIncome}
          extraPaychequesMonthly={extraPaychequesMonthly}
          annualBonusMonthly={annualBonusMonthly}
          totalMonthlyIncome={totalMonthlyIncome}
          fixedHousingCosts={fixedHousingCosts}
          mortgagePayment={mortgagePayment}
          variableExpenses={variableExpenses}
          otherDebtPayments={otherDebtPayments}
          totalMonthlyExpenses={totalMonthlyExpenses}
          monthlySurplus={monthlySurplus}
          runwayMonths={runwayMonths}
        />
      </div>
    </Form>
  );
}
