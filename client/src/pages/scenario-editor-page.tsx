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

export default function ScenarioEditorPage() {
  const [prepaymentSplit, setPrepaymentSplit] = useState([50]);

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
      </div>

      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="mortgage" data-testid="tab-mortgage">Mortgage</TabsTrigger>
          <TabsTrigger value="cashflow" data-testid="tab-cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ef" data-testid="tab-ef">Emergency Fund</TabsTrigger>
          <TabsTrigger value="investments" data-testid="tab-investments">Investments</TabsTrigger>
          <TabsTrigger value="prepayment" data-testid="tab-prepayment">Prepayment</TabsTrigger>
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
                  <Select defaultValue="fixed">
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
                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                <Input id="interest-rate" type="number" step="0.01" placeholder="4.50" data-testid="input-interest-rate" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appreciation-rate">Property Appreciation Rate (% annual)</Label>
                <Input id="appreciation-rate" type="number" step="0.1" placeholder="2.0" data-testid="input-appreciation-rate" />
              </div>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extra-paycheques">Extra Paycheques/Year</Label>
                  <Input id="extra-paycheques" type="number" placeholder="2" data-testid="input-extra-paycheques" />
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
                  <p className="text-sm text-muted-foreground">Property tax, insurance, condo fees</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variable-expenses">Variable Expenses (monthly)</Label>
                  <Input id="variable-expenses" type="number" placeholder="1500" data-testid="input-variable-expenses" />
                  <p className="text-sm text-muted-foreground">Groceries, gas, entertainment</p>
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
                <Select defaultValue="investments">
                  <SelectTrigger id="ef-reroute" data-testid="select-ef-reroute">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investments">Investments</SelectItem>
                    <SelectItem value="prepay">Mortgage Prepayment</SelectItem>
                    <SelectItem value="none">None (save as cash)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Configuration</CardTitle>
              <CardDescription>Plan your investment growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-contribution">Base Monthly Contribution</Label>
                <Input id="base-contribution" type="number" placeholder="1000" data-testid="input-base-contribution" />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prepayment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prepayment Strategy</CardTitle>
              <CardDescription>Configure mortgage prepayment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annual-lump">Annual Lump Sum</Label>
                  <Input id="annual-lump" type="number" placeholder="5000" data-testid="input-annual-lump" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly-extra">Monthly Extra Payment</Label>
                  <Input id="monthly-extra" type="number" placeholder="200" data-testid="input-monthly-extra" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-bonus">Use Annual Bonus for Prepayment</Label>
                  <p className="text-sm text-muted-foreground">Apply bonus to mortgage principal</p>
                </div>
                <Switch id="use-bonus" data-testid="switch-use-bonus" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-extra-pay">Use Extra Paycheques for Prepayment</Label>
                  <p className="text-sm text-muted-foreground">Apply extra paycheques to mortgage</p>
                </div>
                <Switch id="use-extra-pay" data-testid="switch-use-extra-pay" />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="split-slider">Surplus Allocation Split</Label>
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
                    How to split surplus cash between mortgage prepayment and investments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
