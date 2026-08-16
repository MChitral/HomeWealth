import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { StatementFactsResponse } from "../api/mortgage-api";

type PrivilegeRoomPanelProps = {
  facts: StatementFactsResponse | undefined;
};

export function PrivilegeRoomPanel({ facts }: PrivilegeRoomPanelProps) {
  const privilege = facts?.privilege;

  return (
    <Card data-testid="privilege-room-panel">
      <CardHeader>
        <CardTitle>Prepayment privileges</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <p data-testid="lump-sum-used">Lump-sum used: ${privilege?.lumpSumUsed ?? "0.00"}</p>
        <p data-testid="double-up-count">Double-Up events: {privilege?.doubleUpCount ?? 0}</p>
        {privilege?.pendingExtra && (
          <p data-testid="unclassified-extra">Unclassified extra is pending a Double-Up tag.</p>
        )}
        <p className="text-muted-foreground">
          Payment-increase unused room and skip counters appear after you confirm the annual
          statement.
        </p>
      </CardContent>
    </Card>
  );
}
