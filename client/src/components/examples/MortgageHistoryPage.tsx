import MortgageHistoryPage from "../../pages/mortgage-history-page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MortgageHistoryPageExample() {
  return (
    <SidebarProvider>
      <div className="p-6 bg-background">
        <MortgageHistoryPage />
      </div>
    </SidebarProvider>
  );
}
