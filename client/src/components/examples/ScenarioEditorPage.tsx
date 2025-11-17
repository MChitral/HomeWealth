import ScenarioEditorPage from "../../pages/scenario-editor-page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ScenarioEditorPageExample() {
  return (
    <SidebarProvider>
      <div className="p-6 bg-background">
        <ScenarioEditorPage />
      </div>
    </SidebarProvider>
  );
}
