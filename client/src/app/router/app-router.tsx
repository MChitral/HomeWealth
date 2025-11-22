import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import DashboardPage from "@/pages/dashboard-page";
import MortgagePage from "@/pages/mortgage-page";
import ScenarioListPage from "@/pages/scenario-list-page";
import ScenarioEditorPage from "@/pages/scenario-editor-page";
import ComparisonPage from "@/pages/comparison-page";
import CashFlowPage from "@/pages/cash-flow-page";
import EmergencyFundPage from "@/pages/emergency-fund-page";
import LandingPage from "@/pages/landing-page";
import NotFound from "@/pages/not-found";

export function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/mortgage" component={MortgagePage} />
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

