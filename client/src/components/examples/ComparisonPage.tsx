import ComparisonPage from "../../pages/comparison-page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ComparisonPageExample() {
  return (
    <SidebarProvider>
      <div className="p-6 bg-background">
        <ComparisonPage />
      </div>
    </SidebarProvider>
  );
}
