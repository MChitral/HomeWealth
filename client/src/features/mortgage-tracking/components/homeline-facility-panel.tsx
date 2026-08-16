import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { StatementFactsResponse } from "../api/mortgage-api";

type HomelineFacilityPanelProps = {
  facts: StatementFactsResponse | undefined;
  calculatedRoom?: string;
};

export function HomelineFacilityPanel({ facts, calculatedRoom }: HomelineFacilityPanelProps) {
  const facility = facts?.facility;
  if (!facility) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Homeline facility</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Confirm a Homeline monthly statement to see observed credit room.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="homeline-facility-panel">
      <CardHeader>
        <CardTitle>Homeline facility</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <p>Mortgage outstanding: ${Number(facility.mortgageOutstanding).toLocaleString()}</p>
        {facility.planTotalLimit && (
          <p>Plan / HELOC limit: ${Number(facility.planTotalLimit).toLocaleString()}</p>
        )}
        <p>HELOC drawn: ${Number(facility.helocDrawn).toLocaleString()}</p>
        <p data-testid="observed-available-credit">
          Observed available credit: ${Number(facility.availableCredit).toLocaleString()}
        </p>
        {calculatedRoom && <p>Calculated credit room: ${calculatedRoom}</p>}
      </CardContent>
    </Card>
  );
}
