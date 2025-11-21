import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Save, DollarSign, TrendingDown, CreditCard, Briefcase, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { queryClient } from "@/shared/api/query-client";

import { useCashFlowData } from "./hooks";
import { cashFlowApi, cashFlowQueryKeys, type CashFlowPayload } from "./api";

const DEFAULTS = {
  monthlyIncome: 8000,
  extraPaycheques: 2,
  annualBonus: 10000,
  propertyTax: 400,
  insurance: 150,
  condoFees: 0,
  utilities: 200,
  groceries: 600,
  dining: 300,
  transportation: 200,
  entertainment: 400,
  carLoan: 0,
  studentLoan: 0,
  creditCard: 0,
} as const;

export default function CashFlowFeature() {
  const { toast } = useToast();
  const { cashFlow, isLoading } = useCashFlowData();

  usePageTitle("Cash Flow Settings | Mortgage Strategy");

  const [monthlyIncome, setMonthlyIncome] = useState<number>(DEFAULTS.monthlyIncome);
  const [extraPaycheques, setExtraPaycheques] = useState<number>(DEFAULTS.extraPaycheques);
  const [annualBonus, setAnnualBonus] = useState<number>(DEFAULTS.annualBonus);

  const [propertyTax, setPropertyTax] = useState<number>(DEFAULTS.propertyTax);
  const [insurance, setInsurance] = useState<number>(DEFAULTS.insurance);
  const [condoFees, setCondoFees] = useState<number>(DEFAULTS.condoFees);
  const [utilities, setUtilities] = useState<number>(DEFAULTS.utilities);

  const [groceries, setGroceries] = useState<number>(DEFAULTS.groceries);
  const [dining, setDining] = useState<number>(DEFAULTS.dining);
  const [transportation, setTransportation] = useState<number>(DEFAULTS.transportation);
  const [entertainment, setEntertainment] = useState<number>(DEFAULTS.entertainment);

  const [carLoan, setCarLoan] = useState<number>(DEFAULTS.carLoan);
  const [studentLoan, setStudentLoan] = useState<number>(DEFAULTS.studentLoan);
  const [creditCard, setCreditCard] = useState<number>(DEFAULTS.creditCard);

  useEffect(() => {
    if (!cashFlow) return;

    setMonthlyIncome(cashFlow.monthlyIncome != null ? Number(cashFlow.monthlyIncome) : DEFAULTS.monthlyIncome);
    setExtraPaycheques(cashFlow.extraPaycheques ?? DEFAULTS.extraPaycheques);
    setAnnualBonus(cashFlow.annualBonus != null ? Number(cashFlow.annualBonus) : DEFAULTS.annualBonus);

    setPropertyTax(cashFlow.propertyTax != null ? Number(cashFlow.propertyTax) : DEFAULTS.propertyTax);
    setInsurance(cashFlow.homeInsurance != null ? Number(cashFlow.homeInsurance) : DEFAULTS.insurance);
    setCondoFees(cashFlow.condoFees != null ? Number(cashFlow.condoFees) : DEFAULTS.condoFees);
    setUtilities(cashFlow.utilities != null ? Number(cashFlow.utilities) : DEFAULTS.utilities);

    setGroceries(cashFlow.groceries != null ? Number(cashFlow.groceries) : DEFAULTS.groceries);
    setDining(cashFlow.dining != null ? Number(cashFlow.dining) : DEFAULTS.dining);
    setTransportation(cashFlow.transportation != null ? Number(cashFlow.transportation) : DEFAULTS.transportation);
    setEntertainment(cashFlow.entertainment != null ? Number(cashFlow.entertainment) : DEFAULTS.entertainment);

    setCarLoan(cashFlow.carLoan != null ? Number(cashFlow.carLoan) : DEFAULTS.carLoan);
    setStudentLoan(cashFlow.studentLoan != null ? Number(cashFlow.studentLoan) : DEFAULTS.studentLoan);
    setCreditCard(cashFlow.creditCard != null ? Number(cashFlow.creditCard) : DEFAULTS.creditCard);
  }, [cashFlow]);

  const saveMutation = useMutation({
    mutationFn: (payload: CashFlowPayload) => {
      if (cashFlow?.id) {
        return cashFlowApi.update(cashFlow.id, payload);
      }
      return cashFlowApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashFlowQueryKeys.cashFlow() });
      toast({
        title: "Cash flow saved",
        description: "Your income and expenses have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save cash flow data",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const payload: CashFlowPayload = {
      monthlyIncome: monthlyIncome.toString(),
      extraPaycheques,
      annualBonus: annualBonus.toString(),
      propertyTax: propertyTax.toString(),
      homeInsurance: insurance.toString(),
      condoFees: condoFees.toString(),
      utilities: utilities.toString(),
      groceries: groceries.toString(),
      dining: dining.toString(),
      transportation: transportation.toString(),
      entertainment: entertainment.toString(),
      carLoan: carLoan.toString(),
      studentLoan: studentLoan.toString(),
      creditCard: creditCard.toString(),
    };

    saveMutation.mutate(payload);
  };

  const extraPaychequesMonthly = useMemo(
    () => (monthlyIncome * extraPaycheques) / 12,
    [monthlyIncome, extraPaycheques],
  );
  const annualBonusMonthly = useMemo(() => annualBonus / 12, [annualBonus]);
  const totalMonthlyIncome = useMemo(
    () => monthlyIncome + extraPaychequesMonthly + annualBonusMonthly,
    [monthlyIncome, extraPaychequesMonthly, annualBonusMonthly],
  );

  const fixedHousingCosts = propertyTax + insurance + condoFees + utilities;
  const variableExpenses = groceries + dining + transportation + entertainment;
  const otherDebtPayments = carLoan + studentLoan + creditCard;
  const mortgagePayment = 2100;
  const totalMonthlyExpenses = fixedHousingCosts + variableExpenses + otherDebtPayments + mortgagePayment;
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;

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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Variable Expenses</CardTitle>
          </div>
          <CardDescription>Expenses that fluctuate month-to-month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="groceries">Groceries (monthly)</Label>
              <Input
                id="groceries"
                type="number"
                placeholder="600"
                value={groceries}
                onChange={(event) => setGroceries(Number(event.target.value) || 0)}
                data-testid="input-groceries"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dining">Dining Out (monthly)</Label>
              <Input
                id="dining"
                type="number"
                placeholder="300"
                value={dining}
                onChange={(event) => setDining(Number(event.target.value) || 0)}
                data-testid="input-dining"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transportation">Transportation (monthly)</Label>
              <Input
                id="transportation"
                type="number"
                placeholder="200"
                value={transportation}
                onChange={(event) => setTransportation(Number(event.target.value) || 0)}
                data-testid="input-transportation"
              />
              <p className="text-sm text-muted-foreground">Gas, transit, parking</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entertainment">Entertainment & Shopping</Label>
              <Input
                id="entertainment"
                type="number"
                placeholder="400"
                value={entertainment}
                onChange={(event) => setEntertainment(Number(event.target.value) || 0)}
                data-testid="input-entertainment"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="total-variable">Total Variable Expenses</Label>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-2xl font-mono font-bold">${variableExpenses.toLocaleString()}/month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Other Debt Payments</CardTitle>
          </div>
          <CardDescription>Non-mortgage debt obligations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car-loan">Car Loan (monthly)</Label>
              <Input
                id="car-loan"
                type="number"
                placeholder="0"
                value={carLoan}
                onChange={(event) => setCarLoan(Number(event.target.value) || 0)}
                data-testid="input-car-loan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-loan">Student Loan (monthly)</Label>
              <Input
                id="student-loan"
                type="number"
                placeholder="0"
                value={studentLoan}
                onChange={(event) => setStudentLoan(Number(event.target.value) || 0)}
                data-testid="input-student-loan"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card">Credit Card Payments (monthly)</Label>
            <Input
              id="credit-card"
              type="number"
              placeholder="0"
              value={creditCard}
              onChange={(event) => setCreditCard(Number(event.target.value) || 0)}
              data-testid="input-credit-card"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="total-debt">Total Other Debt Payments</Label>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-2xl font-mono font-bold">${otherDebtPayments.toLocaleString()}/month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>High-level view of cash inflows and outflows</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Monthly Income</p>
            <div className="rounded-md border p-4 space-y-2 bg-background">
              <div className="flex items-center justify-between text-sm">
                <span>Base Salary</span>
                <span className="font-medium">${monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Extra Paycheques</span>
                <span className="font-medium">${extraPaychequesMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Bonus (monthlyized)</span>
                <span className="font-medium">${annualBonusMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total Monthly Income</span>
                <span>${totalMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Monthly Expenses</p>
            <div className="rounded-md border p-4 space-y-2 bg-background">
              <div className="flex items-center justify-between text-sm">
                <span>Housing (non-mortgage)</span>
                <span className="font-medium">${fixedHousingCosts.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Mortgage Payment</span>
                <span className="font-medium">${mortgagePayment.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Variable Spending</span>
                <span className="font-medium">${variableExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Other Debt</span>
                <span className="font-medium">${otherDebtPayments.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total Monthly Expenses</span>
                <span>${totalMonthlyExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-md border p-4 bg-background space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Surplus / Deficit</p>
                <p className="text-3xl font-semibold">
                  {monthlySurplus >= 0 ? "+" : "-"}${Math.abs(monthlySurplus).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Runway</p>
                <p className="text-2xl font-semibold">
                  {monthlySurplus > 0 ? `${Math.round((totalMonthlyIncome / totalMonthlyExpenses) * 12)} months` : "Review plan"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Mortgage payment is mocked for now; once the amortization engine is connected this will reflect actual payments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

