import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardPage from "@/pages/dashboard-page";
import MortgageHistoryPage from "@/pages/mortgage-history-page";
import ScenarioListPage from "@/pages/scenario-list-page";
import ScenarioEditorPage from "@/pages/scenario-editor-page";
import ComparisonPage from "@/pages/comparison-page";
import CashFlowPage from "@/pages/cash-flow-page";
import EmergencyFundPage from "@/pages/emergency-fund-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/mortgage-history" component={MortgageHistoryPage} />
      <Route path="/scenarios" component={ScenarioListPage} />
      <Route path="/scenarios/:id" component={ScenarioEditorPage} />
      <Route path="/scenarios/new" component={ScenarioEditorPage} />
      <Route path="/comparison" component={ComparisonPage} />
      <Route path="/cash-flow" component={CashFlowPage} />
      <Route path="/emergency-fund" component={EmergencyFundPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-auto p-6">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
