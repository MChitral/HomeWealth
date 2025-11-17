import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, DollarSign, TrendingDown, CreditCard, Briefcase } from "lucide-react";
import { useState } from "react";

export default function CashFlowPage() {
  // Income state
  const [monthlyIncome, setMonthlyIncome] = useState(8000);
  const [extraPaycheques, setExtraPaycheques] = useState(2);
  const [annualBonus, setAnnualBonus] = useState(10000);

  // Fixed expenses state
  const [propertyTax, setPropertyTax] = useState(400);
  const [insurance, setInsurance] = useState(150);
  const [condoFees, setCondoFees] = useState(0);
  const [utilities, setUtilities] = useState(200);

  // Variable expenses state
  const [groceries, setGroceries] = useState(600);
  const [dining, setDining] = useState(300);
  const [transportation, setTransportation] = useState(200);
  const [entertainment, setEntertainment] = useState(400);

  // Other debt state
  const [carLoan, setCarLoan] = useState(0);
  const [studentLoan, setStudentLoan] = useState(0);
  const [creditCard, setCreditCard] = useState(0);

  // Calculated values
  const extraPaychequesMonthly = (monthlyIncome * extraPaycheques) / 12; // Annualized extra paycheques
  const annualBonusMonthly = annualBonus / 12;
  const totalMonthlyIncome = monthlyIncome + extraPaychequesMonthly + annualBonusMonthly;

  const fixedHousingCosts = propertyTax + insurance + condoFees + utilities;
  const variableExpenses = groceries + dining + transportation + entertainment;
  const otherDebtPayments = carLoan + studentLoan + creditCard;

  // Mock mortgage payment from history - TODO: fetch from backend
  const mortgagePayment = 2100;

  const totalMonthlyExpenses = fixedHousingCosts + variableExpenses + otherDebtPayments + mortgagePayment;
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Cash Flow Settings</h1>
          <p className="text-muted-foreground">Configure your income and expenses (applies to all scenarios)</p>
        </div>
        <Button data-testid="button-save">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

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
                onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
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
                onChange={(e) => setExtraPaycheques(Number(e.target.value) || 0)}
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
              onChange={(e) => setAnnualBonus(Number(e.target.value) || 0)}
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
                onChange={(e) => setPropertyTax(Number(e.target.value) || 0)}
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
                onChange={(e) => setInsurance(Number(e.target.value) || 0)}
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
                onChange={(e) => setCondoFees(Number(e.target.value) || 0)}
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
                onChange={(e) => setUtilities(Number(e.target.value) || 0)}
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
                onChange={(e) => setGroceries(Number(e.target.value) || 0)}
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
                onChange={(e) => setDining(Number(e.target.value) || 0)}
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
                onChange={(e) => setTransportation(Number(e.target.value) || 0)}
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
                onChange={(e) => setEntertainment(Number(e.target.value) || 0)}
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
                onChange={(e) => setCarLoan(Number(e.target.value) || 0)}
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
                onChange={(e) => setStudentLoan(Number(e.target.value) || 0)}
                data-testid="input-student-loan" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card">Credit Card Minimum (monthly)</Label>
            <Input 
              id="credit-card" 
              type="number" 
              placeholder="0" 
              value={creditCard}
              onChange={(e) => setCreditCard(Number(e.target.value) || 0)}
              data-testid="input-credit-card" 
            />
            <p className="text-sm text-muted-foreground">If carrying a balance</p>
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

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Monthly Cash Flow Summary</CardTitle>
          <CardDescription>Your monthly surplus available for financial goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">Income Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Income (base)</span>
                <span className="font-mono">${monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Extra Paycheques (annualized)</span>
                <span className="font-mono text-green-600">+${extraPaychequesMonthly.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Annual Bonus (annualized)</span>
                <span className="font-mono text-green-600">+${annualBonusMonthly.toFixed(0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Monthly Income</span>
                <span className="font-mono text-lg text-green-600">${totalMonthlyIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <p className="text-sm font-medium mb-3">Expenses Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fixed Housing Costs</span>
                <span className="font-mono">-${fixedHousingCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Variable Expenses</span>
                <span className="font-mono">-${variableExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Debt Payments</span>
                <span className="font-mono">-${otherDebtPayments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mortgage Payment (from history)</span>
                <span className="font-mono">-${mortgagePayment.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Monthly Expenses</span>
                <span className="font-mono text-lg text-orange-600">-${totalMonthlyExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className={`p-4 rounded-md ${monthlySurplus >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Surplus</p>
                <p className="text-xs text-muted-foreground">Available for emergency fund, investments, and mortgage prepayment</p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-mono font-bold ${monthlySurplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ${monthlySurplus.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </p>
              </div>
            </div>
            {monthlySurplus < 0 && (
              <p className="text-sm text-destructive font-medium mt-2">
                ⚠️ Warning: Negative cash flow! You're spending more than you earn.
              </p>
            )}
          </div>

          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Note:</span> This surplus is split across your scenarios based on
              their emergency fund contribution, investment contribution, and prepayment settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
