import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { MortgageBalanceChart } from "@/components/mortgage-balance-chart";

export default function ScenarioEditorPage() {
  const [prepaymentSplit, setPrepaymentSplit] = useState([50]);
  const [useBonus, setUseBonus] = useState(false);
  const [useExtraPay, setUseExtraPay] = useState(false);
  const [monthlyExtra, setMonthlyExtra] = useState("200");
  const [annualLump, setAnnualLump] = useState("5000");

  // Mock mortgage projection based on current prepayment settings
  const mortgageProjection = [
    { year: 0, balance: 400000, principal: 0, interest: 0 },
    { year: 2, balance: 360000, principal: 30000, interest: 10000 },
    { year: 4, balance: 315000, principal: 65000, interest: 20000 },
    { year: 6, balance: 265000, principal: 105000, interest: 30000 },
    { year: 8, balance: 210000, principal: 150000, interest: 40000 },
    { year: 10, balance: 150000, principal: 200000, interest: 50000 },
  ];

  const projectedPayoff = 18.5; // years
  const totalInterest = 92500; // dollars

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/scenarios">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Edit Scenario</h1>
          <p className="text-muted-foreground">Configure your financial strategy</p>
        </div>
        <Button data-testid="button-save">
          <Save className="h-4 w-4 mr-2" />
          Save Scenario
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="scenario-name">Scenario Name</Label>
          <Input
            id="scenario-name"
            placeholder="e.g., Balanced Strategy"
            defaultValue="Balanced Strategy"
            data-testid="input-scenario-name"
          />
        </div>
        <div>
          <Label htmlFor="scenario-description">Description (Optional)</Label>
          <Input
            id="scenario-description"
            placeholder="Brief description of this strategy"
            data-testid="input-scenario-description"
          />
        </div>
        <div>
          <Label htmlFor="horizon">Projection Horizon (years)</Label>
          <Select defaultValue="10">
            <SelectTrigger id="horizon" data-testid="select-horizon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Years</SelectItem>
              <SelectItem value="15">15 Years</SelectItem>
              <SelectItem value="20">20 Years</SelectItem>
              <SelectItem value="25">25 Years</SelectItem>
              <SelectItem value="30">30 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mortgage" data-testid="tab-mortgage">Mortgage & Prepayment</TabsTrigger>
          <TabsTrigger value="cashflow" data-testid="tab-cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ef" data-testid="tab-ef">Emergency Fund</TabsTrigger>
          <TabsTrigger value="investments" data-testid="tab-investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="mortgage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Configuration</CardTitle>
              <CardDescription>Set up your mortgage details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="home-price">Home Price</Label>
                  <Input id="home-price" type="number" placeholder="500000" data-testid="input-home-price" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down-payment">Down Payment</Label>
                  <Input id="down-payment" type="number" placeholder="100000" data-testid="input-down-payment" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amortization">Amortization (years)</Label>
                  <Input id="amortization" type="number" placeholder="25" data-testid="input-amortization" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Initial Term (years)</Label>
                  <Input id="term" type="number" placeholder="5" data-testid="input-term" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-frequency">Payment Frequency</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger id="payment-frequency" data-testid="select-payment-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="accelerated">Accelerated Bi-Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mortgage-type">Mortgage Type</Label>
                  <Select defaultValue="variable-fixed">
                    <SelectTrigger id="mortgage-type" data-testid="select-mortgage-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="variable-changing">Variable (Changing Payment)</SelectItem>
                      <SelectItem value="variable-fixed">Variable (Fixed Payment)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initial-rate">Initial Interest Rate or Spread (%)</Label>
                <Input id="initial-rate" type="number" step="0.01" placeholder="Prime - 0.80" data-testid="input-initial-rate" />
                <p className="text-sm text-muted-foreground">For variable: enter as spread (e.g., -0.80 for Prime - 0.80%)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appreciation-rate">Property Appreciation Rate (% annual)</Label>
                <Input id="appreciation-rate" type="number" step="0.1" placeholder="2.0" data-testid="input-appreciation-rate" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prepayment Strategy</CardTitle>
              <CardDescription>Configure how aggressively you'll pay down your mortgage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annual-lump">Annual Lump Sum Prepayment</Label>
                  <Input 
                    id="annual-lump" 
                    type="number" 
                    placeholder="5000" 
                    value={annualLump}
                    onChange={(e) => setAnnualLump(e.target.value)}
                    data-testid="input-annual-lump" 
                  />
                  <p className="text-sm text-muted-foreground">Apply once per year (typically up to 15-20% of original principal)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly-extra">Monthly Extra Payment</Label>
                  <Input 
                    id="monthly-extra" 
                    type="number" 
                    placeholder="200" 
                    value={monthlyExtra}
                    onChange={(e) => setMonthlyExtra(e.target.value)}
                    data-testid="input-monthly-extra" 
                  />
                  <p className="text-sm text-muted-foreground">Additional principal payment each month</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-bonus">Use Annual Bonus for Prepayment</Label>
                  <p className="text-sm text-muted-foreground">Apply bonus to mortgage principal</p>
                </div>
                <Switch 
                  id="use-bonus" 
                  checked={useBonus}
                  onCheckedChange={setUseBonus}
                  data-testid="switch-use-bonus" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-extra-pay">Use Extra Paycheques for Prepayment</Label>
                  <p className="text-sm text-muted-foreground">Apply extra paycheques to mortgage</p>
                </div>
                <Switch 
                  id="use-extra-pay" 
                  checked={useExtraPay}
                  onCheckedChange={setUseExtraPay}
                  data-testid="switch-use-extra-pay" 
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="split-slider">Surplus Cash Allocation</Label>
                    <span className="text-sm font-mono text-muted-foreground">
                      {prepaymentSplit[0]}% Prepay / {100 - prepaymentSplit[0]}% Invest
                    </span>
                  </div>
                  <Slider
                    id="split-slider"
                    min={0}
                    max={100}
                    step={5}
                    value={prepaymentSplit}
                    onValueChange={setPrepaymentSplit}
                    data-testid="slider-split"
                  />
                  <p className="text-sm text-muted-foreground">
                    How to split surplus cash (after EF is full) between mortgage prepayment and investments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projected Mortgage Outcome</CardTitle>
              <CardDescription>
                Based on current prepayment strategy: 
                {monthlyExtra && parseFloat(monthlyExtra) > 0 && ` $${monthlyExtra}/month`}
                {annualLump && parseFloat(annualLump) > 0 && ` + $${annualLump}/year lump sum`}
                {useBonus && " + annual bonus"}
                {useExtraPay && " + extra paycheques"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Projected Payoff</p>
                  <p className="text-2xl font-bold font-mono">{projectedPayoff} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-2xl font-bold font-mono">${totalInterest.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Interest Saved</p>
                  <p className="text-2xl font-bold font-mono text-green-600">$25,000</p>
                  <p className="text-xs text-muted-foreground">vs minimum payments</p>
                </div>
              </div>
              <MortgageBalanceChart data={mortgageProjection} />
              <p className="text-sm text-muted-foreground italic">
                Adjust prepayment settings above to see how they affect your mortgage payoff timeline
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Configuration</CardTitle>
              <CardDescription>Configure your income and expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-income">Monthly Income (base)</Label>
                  <Input id="monthly-income" type="number" placeholder="8000" data-testid="input-monthly-income" />
                  <p className="text-sm text-muted-foreground">Regular bi-weekly paycheques (2 per month)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extra-paycheques">Extra Paycheques/Year</Label>
                  <Input id="extra-paycheques" type="number" placeholder="2" data-testid="input-extra-paycheques" />
                  <p className="text-sm text-muted-foreground">Typical for bi-weekly pay (26 weeks = 2 extra)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual-bonus">Annual Bonus</Label>
                <Input id="annual-bonus" type="number" placeholder="10000" data-testid="input-annual-bonus" />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fixed-expenses">Fixed Expenses (monthly)</Label>
                  <Input id="fixed-expenses" type="number" placeholder="2000" data-testid="input-fixed-expenses" />
                  <p className="text-sm text-muted-foreground">Property tax, insurance, condo fees, utilities</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variable-expenses">Variable Expenses (monthly)</Label>
                  <Input id="variable-expenses" type="number" placeholder="1500" data-testid="input-variable-expenses" />
                  <p className="text-sm text-muted-foreground">Groceries, gas, entertainment, dining</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-debt">Other Debt Payments (monthly)</Label>
                <Input id="other-debt" type="number" placeholder="500" data-testid="input-other-debt" />
                <p className="text-sm text-muted-foreground">Car loans, credit cards, student loans</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ef" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Fund Configuration</CardTitle>
              <CardDescription>Build your financial safety net</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ef-target">Target Amount</Label>
                <Input id="ef-target" type="number" placeholder="30000" data-testid="input-ef-target" />
                <p className="text-sm text-muted-foreground">Recommended: 3-6 months of expenses</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ef-contribution">Monthly Contribution</Label>
                <Input id="ef-contribution" type="number" placeholder="500" data-testid="input-ef-contribution" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="ef-reroute">After Target is Reached, Redirect To:</Label>
                <Select defaultValue="split">
                  <SelectTrigger id="ef-reroute" data-testid="select-ef-reroute">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Split per Surplus Allocation (recommended)</SelectItem>
                    <SelectItem value="investments">100% to Investments</SelectItem>
                    <SelectItem value="prepay">100% to Mortgage Prepayment</SelectItem>
                    <SelectItem value="none">None (save as cash)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  "Split" option uses the Surplus Allocation slider from Mortgage tab
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Configuration</CardTitle>
              <CardDescription>Plan your investment growth (TFSA, RRSP, non-registered)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-contribution">Base Monthly Contribution</Label>
                <Input id="base-contribution" type="number" placeholder="1000" data-testid="input-base-contribution" />
                <p className="text-sm text-muted-foreground">Fixed amount invested each month</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual-return">Expected Annual Return (%)</Label>
                <Input id="annual-return" type="number" step="0.1" placeholder="6.0" data-testid="input-annual-return" />
                <p className="text-sm text-muted-foreground">Historical average: 6-8% for balanced portfolio</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compounding">Compounding Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="compounding" data-testid="select-compounding">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-2">Additional Investment Sources</p>
                <p className="text-sm text-muted-foreground">
                  After Emergency Fund is full, surplus cash is split between investments and mortgage prepayment 
                  based on the allocation slider in the Mortgage tab.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
