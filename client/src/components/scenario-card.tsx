import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, GitCompare } from "lucide-react";

interface ScenarioCardProps {
  id: string;
  name: string;
  description?: string;
  lastModified: string;
  netWorth: string;
  mortgageBalance: string;
  onEdit: () => void;
  onCompare: () => void;
}

export function ScenarioCard({
  id,
  name,
  description,
  lastModified,
  netWorth,
  mortgageBalance,
  onEdit,
  onCompare,
}: ScenarioCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-scenario-${id}`}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <p className="text-sm text-muted-foreground">Last modified: {lastModified}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Net Worth (10yr)</span>
            <span className="text-sm font-mono font-medium">{netWorth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Mortgage Balance</span>
            <span className="text-sm font-mono font-medium">{mortgageBalance}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="default" size="sm" onClick={onEdit} data-testid={`button-edit-${id}`}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onCompare} data-testid={`button-compare-${id}`}>
          <GitCompare className="h-4 w-4 mr-1" />
          Compare
        </Button>
      </CardFooter>
    </Card>
  );
}
