import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface ScenarioBasicInfoFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

export function ScenarioBasicInfoForm({
  name,
  setName,
  description,
  setDescription,
}: ScenarioBasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="scenario-name">Scenario Name</Label>
        <Input
          id="scenario-name"
          placeholder="e.g., Balanced Strategy"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="input-scenario-name"
        />
      </div>
      <div>
        <Label htmlFor="scenario-description">Description (Optional)</Label>
        <Input
          id="scenario-description"
          placeholder="Brief description of this strategy"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="input-scenario-description"
        />
      </div>
      <div>
        <Label htmlFor="horizon">Projection Horizon (years)</Label>
        <Select defaultValue="10">
          <SelectTrigger id="horizon" data-testid="select-horizon">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 Years</SelectItem>
            <SelectItem value="15">15 Years</SelectItem>
            <SelectItem value="20">20 Years</SelectItem>
            <SelectItem value="25">25 Years</SelectItem>
            <SelectItem value="30">30 Years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

