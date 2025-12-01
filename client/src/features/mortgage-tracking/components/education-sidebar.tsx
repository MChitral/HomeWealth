import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function EducationSidebar() {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">How Canadian Mortgage Terms Work</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          <div className="w-2 bg-primary rounded" />
          <p className="text-sm">
            <span className="font-medium">Term Lock (3-5 years typical):</span> You lock in either a fixed rate 
            OR a variable spread (e.g., Prime - 0.80%) for the term duration.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="w-2 bg-chart-1 rounded" />
          <p className="text-sm">
            <span className="font-medium">Fixed Rate Terms:</span> Your rate stays constant for the entire term. 
            After term ends, you renew at a new rate.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="w-2 bg-chart-2 rounded" />
          <p className="text-sm">
            <span className="font-medium">Variable Rate Terms:</span> Your spread is locked (e.g., Prime - 0.80%), 
            but Prime rate itself changes monthly as Bank of Canada adjusts it.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="w-2 bg-chart-3 rounded" />
          <p className="text-sm">
            <span className="font-medium">Term Renewal:</span> When your term expires, you negotiate a new 
            rate/spread for the next term (same or different lender).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

