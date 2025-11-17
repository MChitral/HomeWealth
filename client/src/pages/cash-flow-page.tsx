import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, DollarSign, TrendingDown, CreditCard, Briefcase } from "lucide-react";

export default function CashFlowPage() {
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
                defaultValue="8000"
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
                defaultValue="2"
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
              defaultValue="10000"
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
                defaultValue="400"
                data-testid="input-property-tax" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Home Insurance (monthly)</Label>
              <Input 
                id="insurance" 
                type="number" 
                placeholder="150" 
                defaultValue="150"
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
                defaultValue="0"
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
                defaultValue="200"
                data-testid="input-utilities" 
              />
              <p className="text-sm text-muted-foreground">Gas, electric, water, internet</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="total-fixed">Total Fixed Housing Costs</Label>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-2xl font-mono font-bold">$750/month</p>
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
                defaultValue="600"
                data-testid="input-groceries" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dining">Dining Out (monthly)</Label>
              <Input 
                id="dining" 
                type="number" 
                placeholder="300" 
                defaultValue="300"
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
                defaultValue="200"
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
                defaultValue="400"
                data-testid="input-entertainment" 
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="total-variable">Total Variable Expenses</Label>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-2xl font-mono font-bold">$1,500/month</p>
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
                defaultValue="0"
                data-testid="input-car-loan" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-loan">Student Loan (monthly)</Label>
              <Input 
                id="student-loan" 
                type="number" 
                placeholder="0" 
                defaultValue="0"
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
              defaultValue="0"
              data-testid="input-credit-card" 
            />
            <p className="text-sm text-muted-foreground">If carrying a balance</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="total-debt">Total Other Debt Payments</Label>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-2xl font-mono font-bold">$0/month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
              <p className="text-2xl font-mono font-bold text-green-600">$8,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-2xl font-mono font-bold text-orange-600">$2,250</p>
              <p className="text-xs text-muted-foreground mt-1">Excluding mortgage</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mortgage Payment</p>
              <p className="text-2xl font-mono font-bold">$2,100</p>
              <p className="text-xs text-muted-foreground mt-1">From mortgage history</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Surplus</p>
              <p className="text-2xl font-mono font-bold text-primary">$3,650</p>
              <p className="text-xs text-muted-foreground mt-1">Available for EF/invest/prepay</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
