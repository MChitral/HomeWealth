import { ScenarioCard } from "@/components/scenario-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ScenarioListPage() {
  const [, setLocation] = useLocation();

  const scenarios = [
    {
      id: "1",
      name: "Aggressive Prepayment",
      description: "Focus on paying down mortgage as quickly as possible",
      lastModified: "2 days ago",
      netWorth: "$587,000",
      mortgageBalance: "$125,000",
    },
    {
      id: "2",
      name: "Balanced Strategy",
      description: "50/50 split between mortgage prepayment and investments",
      lastModified: "1 week ago",
      netWorth: "$625,000",
      mortgageBalance: "$150,000",
    },
    {
      id: "3",
      name: "Investment Focus",
      description: "Maximize investment contributions, minimum mortgage payments",
      lastModified: "2 weeks ago",
      netWorth: "$680,000",
      mortgageBalance: "$185,000",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Scenarios</h1>
          <p className="text-muted-foreground">Compare different financial strategies</p>
        </div>
        <Link href="/scenarios/new">
          <Button data-testid="button-new-scenario">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            {...scenario}
            onEdit={() => {
              console.log(`Edit scenario ${scenario.id}`);
              setLocation(`/scenarios/${scenario.id}`);
            }}
            onCompare={() => {
              console.log(`Compare scenario ${scenario.id}`);
              setLocation(`/comparison?scenarios=${scenario.id}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
