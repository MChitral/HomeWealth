import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { CreditCard } from "lucide-react";

interface DebtSectionProps {
  carLoan: number;
  setCarLoan: (value: number) => void;
  studentLoan: number;
  setStudentLoan: (value: number) => void;
  creditCard: number;
  setCreditCard: (value: number) => void;
  otherDebtPayments: number;
}

export function DebtSection({
  carLoan,
  setCarLoan,
  studentLoan,
  setStudentLoan,
  creditCard,
  setCreditCard,
  otherDebtPayments,
}: DebtSectionProps) {
  return (
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
  );
}

