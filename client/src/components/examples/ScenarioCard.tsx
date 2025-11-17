import { ScenarioCard } from "../scenario-card";

export default function ScenarioCardExample() {
  return (
    <div className="p-6 bg-background max-w-md">
      <ScenarioCard
        id="1"
        name="Balanced Strategy"
        description="50/50 split between mortgage prepayment and investments"
        lastModified="1 week ago"
        netWorth="$625,000"
        mortgageBalance="$150,000"
        onEdit={() => console.log("Edit clicked")}
        onCompare={() => console.log("Compare clicked")}
      />
    </div>
  );
}
