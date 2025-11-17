import CashFlowPage from "../../pages/cash-flow-page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function CashFlowPageExample() {
  return (
    <SidebarProvider>
      <div className="p-6 bg-background">
        <CashFlowPage />
      </div>
    </SidebarProvider>
  );
}
