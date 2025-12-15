import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function EmergencyFundEducation() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Why This Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 bg-green-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Avoid High-Interest Debt</p>
              <p className="text-sm text-muted-foreground">
                With an emergency fund, you won't need to use credit cards or loans at 20%+ interest
                when unexpected expenses arise.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-blue-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Peace of Mind</p>
              <p className="text-sm text-muted-foreground">
                Knowing you have 6 months of expenses covered lets you focus on long-term goals
                without constant financial anxiety.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-purple-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Foundation for Other Goals</p>
              <p className="text-sm text-muted-foreground">
                Most financial advisors recommend building your emergency fund BEFORE aggressive
                investing or mortgage prepayment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> How quickly you fill this fund and what you
            do after it's full is configured in each scenario. Different scenarios can have
            different contribution strategies while targeting the same amount.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
