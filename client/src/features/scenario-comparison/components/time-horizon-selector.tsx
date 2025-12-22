import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import type { TimeHorizon } from "../types";

interface TimeHorizonSelectorProps {
  value: TimeHorizon;
  onValueChange: (value: TimeHorizon) => void;
}

export function TimeHorizonSelector({ value, onValueChange }: TimeHorizonSelectorProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="time-horizon-select" className="text-sm font-medium text-muted-foreground">
        Time Horizon
      </Label>
      <Select value={value} onValueChange={(val) => onValueChange(val as TimeHorizon)}>
        <SelectTrigger className="w-32" data-testid="select-horizon">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 Years</SelectItem>
          <SelectItem value="20">20 Years</SelectItem>
          <SelectItem value="30">30 Years</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
