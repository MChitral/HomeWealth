import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";

export function EmergencyFundStrategyCard() {
  return (
    <>
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle>Emergency Fund Target</CardTitle>
          <CardDescription>Configured on Emergency Fund page (applies to all scenarios)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-background rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Current Target</p>
            <p className="text-2xl font-mono font-bold mb-2">$30,000</p>
            <p className="text-sm text-muted-foreground">= 6 months of expenses</p>
            <Link href="/emergency-fund">
              <Button variant="outline" size="sm" className="mt-3" data-testid="button-edit-ef-target">
                Edit Target
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Fund Strategy</CardTitle>
          <CardDescription>Configure how this scenario fills the emergency fund</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ef-contribution">Monthly Contribution</Label>
            <Input
              id="ef-contribution"
              type="number"
              placeholder="500"
              defaultValue="500"
              data-testid="input-ef-contribution"
            />
            <p className="text-sm text-muted-foreground">How much to contribute each month until target is reached</p>
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

          <Separator />

          <div className="p-4 bg-muted/50 rounded-md">
            <p className="text-sm font-medium mb-2">Timeline Estimate</p>
            <p className="text-sm text-muted-foreground">
              At $500/month contribution, emergency fund will be fully funded in{" "}
              <span className="font-mono font-semibold">60 months (5 years)</span>. After that, this $500/month will
              be redirected according to your selection above.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

