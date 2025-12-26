import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { TrendingUp, History, Loader2, AlertCircle } from "lucide-react";
import { useCreditRoom } from "@/features/heloc/hooks";

interface CreditRoomDisplayProps {
  mortgageId: string;
  onViewHistory?: () => void;
}

export function CreditRoomDisplay({ mortgageId, onViewHistory }: CreditRoomDisplayProps) {
  const { data: creditRoom, isLoading, error } = useCreditRoom(mortgageId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading credit room...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !creditRoom) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load credit room information</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const utilization = creditRoom.utilization ?? 0;

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-background">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Credit Room
            </CardTitle>
            <CardDescription>Available credit from your re-advanceable mortgage</CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 border-green-300">
            Re-advanceable
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Current Credit Room</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(creditRoom.creditRoom)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Available Credit</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(creditRoom.availableCredit)}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credit Utilization</span>
            <Badge
              variant={
                utilization > 80 ? "destructive" : utilization > 50 ? "default" : "secondary"
              }
            >
              {utilization.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={utilization} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
          <div>
            <div className="text-muted-foreground">Mortgage Balance</div>
            <div className="font-semibold">{formatCurrency(creditRoom.mortgageBalance)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">HELOC Balance</div>
            <div className="font-semibold">{formatCurrency(creditRoom.helocBalance)}</div>
          </div>
        </div>

        {onViewHistory && (
          <div className="pt-2">
            <Button variant="outline" className="w-full" onClick={onViewHistory}>
              <History className="h-4 w-4 mr-2" />
              View Credit Room History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
