import { Link } from "wouter";
import { Button } from "@/shared/ui/button";
import { Save, ArrowLeft } from "lucide-react";

interface ScenarioEditorHeaderProps {
  isNewScenario: boolean;
  onSave: () => void;
  isSaving: boolean;
}

export function ScenarioEditorHeader({ isNewScenario, onSave, isSaving }: ScenarioEditorHeaderProps) {
  return (
    <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-4 -mt-4">
      <Link href="/scenarios">
        <Button variant="ghost" size="icon" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold">{isNewScenario ? "New Scenario" : "Edit Scenario"}</h1>
        <p className="text-muted-foreground">Build a strategy from your current mortgage position</p>
      </div>
      <Button onClick={onSave} disabled={isSaving} data-testid="button-save">
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Saving..." : "Save Scenario"}
      </Button>
    </div>
  );
}

