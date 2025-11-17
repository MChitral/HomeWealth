import EmergencyFundPage from "../../pages/emergency-fund-page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function EmergencyFundPageExample() {
  return (
    <SidebarProvider>
      <div className="p-6 bg-background">
        <EmergencyFundPage />
      </div>
    </SidebarProvider>
  );
}
