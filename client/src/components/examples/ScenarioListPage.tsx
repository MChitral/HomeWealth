import ScenarioListPage from "../../pages/scenario-list-page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ScenarioListPageExample() {
  return (
    <SidebarProvider>
      <div className="p-6 bg-background">
        <ScenarioListPage />
      </div>
    </SidebarProvider>
  );
}
