import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { DollarSign } from "lucide-react";

interface VariableExpensesSectionProps {
  groceries: number;
  setGroceries: (value: number) => void;
  dining: number;
  setDining: (value: number) => void;
  transportation: number;
  setTransportation: (value: number) => void;
  entertainment: number;
  setEntertainment: (value: number) => void;
  variableExpenses: number;
}

export function VariableExpensesSection({
  groceries,
  setGroceries,
  dining,
  setDining,
  transportation,
  setTransportation,
  entertainment,
  setEntertainment,
  variableExpenses,
}: VariableExpensesSectionProps) {
  return (
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
  );
}

