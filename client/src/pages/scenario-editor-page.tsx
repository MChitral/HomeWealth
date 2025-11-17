import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, ArrowLeft, Info } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { MortgageBalanceChart } from "@/components/mortgage-balance-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ScenarioEditorPage() {
  const [prepaymentSplit, setPrepaymentSplit] = useState([50]);
  const [useBonus, setUseBonus] = useState(false);
  const [useExtraPay, setUseExtraPay] = useState(false);
  const [monthlyExtra, setMonthlyExtra] = useState("200");
  const [annualLump, setAnnualLump] = useState("5000");

  // Current mortgage data from Mortgage History (pre-populated)
  const currentMortgageData = {
    homeValue: 500000,
    originalPrincipal: 400000,
    currentBalance: 397745,
    principalPaid: 2255,
    interestPaid: 6145,
    yearsIntoMortgage: 0.33, // 4 months
    currentRate: 6.40,
    currentAmortization: 26.2,
    monthlyPayment: 2100,
    termType: "Variable-Fixed Payment",
    lockedSpread: -0.80,
  };

  // Mock mortgage projection based on current prepayment settings
  // TODO: This would be calculated by backend based on prepayment strategy
  const mortgageProjection = [
    { year: 0, balance: 397745, principal: 0, interest: 0 },
    { year: 2, balance: 355000, principal: 42745, interest: 12000 },
    { year: 4, balance: 310000, principal: 87745, interest: 24000 },
    { year: 6, balance: 260000, principal: 137745, interest: 36000 },
    { year: 8, balance: 205000, principal: 192745, interest: 48000 },
    { year: 10, balance: 145000, principal: 252745, interest: 60000 },
  ];

  const projectedPayoff = 18.2; // years from today
  const totalInterest = 86000; // dollars from today forward

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
          <p className="text-muted-foreground">Build a strategy from your current mortgage position</p>
        </div>
        <Button data-testid="button-save">
          <Save className="h-4 w-4 mr-2" />
          Save Scenario
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your current mortgage data is pre-loaded from Mortgage History. Projections start from today's position.
        </AlertDescription>
      </Alert>

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

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> Income and expenses are configured in the{" "}
            <Link href="/cash-flow" className="text-primary hover:underline">
              Cash Flow page
            </Link>{" "}
            and apply to all scenarios. Here you only configure what differs between strategies.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mortgage" data-testid="tab-mortgage">Mortgage & Prepayment</TabsTrigger>
          <TabsTrigger value="ef" data-testid="tab-ef">Emergency Fund</TabsTrigger>
          <TabsTrigger value="investments" data-testid="tab-investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="mortgage" className="space-y-6">
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle>Current Mortgage Position</CardTitle>
              <CardDescription>Loaded from your Mortgage History (as of latest payment)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Home Value</p>
                  <p className="text-lg font-mono font-semibold">${currentMortgageData.homeValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-lg font-mono font-semibold">${currentMortgageData.currentBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Years Into Mortgage</p>
                  <p className="text-lg font-mono font-semibold">{currentMortgageData.yearsIntoMortgage} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
                  <p className="text-lg font-mono font-semibold">{currentMortgageData.currentRate}%</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Principal Paid So Far</p>
                  <p className="text-base font-mono text-green-600">${currentMortgageData.principalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Interest Paid So Far</p>
                  <p className="text-base font-mono text-orange-600">${currentMortgageData.interestPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Amortization</p>
                  <p className="text-base font-mono">{currentMortgageData.currentAmortization} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                  <p className="text-base font-mono">${currentMortgageData.monthlyPayment.toLocaleString()}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Term Type</p>
                  <p className="text-base font-medium">{currentMortgageData.termType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Locked Spread</p>
                  <p className="text-base font-mono">Prime {currentMortgageData.lockedSpread >= 0 ? '+' : ''}{currentMortgageData.lockedSpread}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Future Rate Assumptions</CardTitle>
              <CardDescription>Model how rates might change over the projection period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate-scenario">Rate Change Scenario</Label>
                <Select defaultValue="current">
                  <SelectTrigger id="rate-scenario" data-testid="select-rate-scenario">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current rate stays constant</SelectItem>
                    <SelectItem value="decrease-slow">Slow decrease (0.25% per year)</SelectItem>
                    <SelectItem value="decrease-fast">Fast decrease (0.50% per year)</SelectItem>
                    <SelectItem value="increase-slow">Slow increase (0.25% per year)</SelectItem>
                    <SelectItem value="increase-fast">Fast increase (0.50% per year)</SelectItem>
                    <SelectItem value="custom">Custom rate schedule</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  For variable mortgages, this affects Prime rate changes. Your spread ({currentMortgageData.lockedSpread}%) stays locked until term renewal.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term-renewal">At Next Term Renewal (future)</Label>
                <Select defaultValue="same">
                  <SelectTrigger id="term-renewal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Keep same spread</SelectItem>
                    <SelectItem value="better">Negotiate better spread (-0.10%)</SelectItem>
                    <SelectItem value="worse">Worse spread (+0.10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appreciation-rate">Property Appreciation Rate (% annual)</Label>
                <Input id="appreciation-rate" type="number" step="0.1" defaultValue="2.0" data-testid="input-appreciation-rate" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prepayment Strategy</CardTitle>
              <CardDescription>Configure how aggressively you'll pay down your mortgage going forward</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Typically up to 15-20% of original principal per year</p>
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
                  <p className="text-sm text-muted-foreground">Additional principal on top of regular payment</p>
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

          <Card className="border-primary">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-primary/10 rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Projected Payoff</p>
                  <p className="text-2xl font-bold font-mono">{projectedPayoff} years</p>
                  <p className="text-xs text-muted-foreground">from today</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Interest (future)</p>
                  <p className="text-2xl font-bold font-mono">${totalInterest.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">from today forward</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Interest Saved</p>
                  <p className="text-2xl font-bold font-mono text-green-600">$32,000</p>
                  <p className="text-xs text-muted-foreground">vs minimum payments</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-3">Mortgage Balance Projection (from today)</p>
                <MortgageBalanceChart data={mortgageProjection} />
              </div>
              <p className="text-sm text-muted-foreground italic">
                Adjust prepayment settings above to see how they affect your mortgage payoff timeline
              </p>
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
