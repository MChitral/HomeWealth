import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";

interface InvestmentStrategyCardProps {
  expectedReturnRate: number;
  setExpectedReturnRate: (rate: number) => void;
}

export function InvestmentStrategyCard({
  expectedReturnRate,
  setExpectedReturnRate,
}: InvestmentStrategyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Configuration</CardTitle>
        <CardDescription>Plan your investment growth (TFSA, RRSP, non-registered)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-contribution">Base Monthly Contribution</Label>
          <Input
            id="base-contribution"
            type="number"
            placeholder="1000"
            data-testid="input-base-contribution"
          />
          <p className="text-sm text-muted-foreground">Fixed amount invested each month</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="annual-return">Expected Annual Return (%)</Label>
          <Input
            id="annual-return"
            type="number"
            step="0.1"
            value={expectedReturnRate}
            onChange={(e) => setExpectedReturnRate(parseFloat(e.target.value) || 0)}
            placeholder="6.0"
            data-testid="input-annual-return"
          />
          <p className="text-sm text-muted-foreground">
            Historical average: 6-8% for balanced portfolio
          </p>
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
            After Emergency Fund is full, surplus cash is split between investments and mortgage
            prepayment based on the allocation slider in the Mortgage tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
