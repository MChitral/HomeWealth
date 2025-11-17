import DashboardPage from "../../pages/dashboard-page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardPageExample() {
  return (
    <SidebarProvider>
      <div className="p-6 bg-background">
        <DashboardPage />
      </div>
    </SidebarProvider>
  );
}
