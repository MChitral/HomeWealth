import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { PageSkeleton } from "@/shared/components/page-skeleton";

// ✅ Route-level code splitting: lazy load pages to reduce initial bundle size
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const MortgagePage = lazy(() => import("@/pages/mortgage-page"));
const PrepaymentPage = lazy(() => import("@/pages/prepayment-page"));
const AnalyticsPage = lazy(() => import("@/pages/analytics-page"));
const ScenarioListPage = lazy(() => import("@/pages/scenario-list-page"));
const ScenarioEditorPage = lazy(() => import("@/pages/scenario-editor-page"));
const ComparisonPage = lazy(() => import("@/pages/comparison-page"));
const CashFlowPage = lazy(() => import("@/pages/cash-flow-page"));
const EmergencyFundPage = lazy(() => import("@/pages/emergency-fund-page"));
const HelocPage = lazy(() => import("@/pages/heloc-page"));
const SmithManeuverPage = lazy(() => import("@/pages/smith-maneuver-page"));
const NotificationPreferencesPage = lazy(() => import("@/pages/notification-preferences-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/mortgage" component={MortgagePage} />
        <Route path="/mortgages/:id/prepay" component={PrepaymentPage} />
        <Route path="/mortgages/:id/analytics" component={AnalyticsPage} />
        <Route path="/scenarios" component={ScenarioListPage} />
        <Route path="/scenarios/:id" component={ScenarioEditorPage} />
        <Route path="/scenarios/new" component={ScenarioEditorPage} />
        <Route path="/comparison" component={ComparisonPage} />
        <Route path="/cash-flow" component={CashFlowPage} />
        <Route path="/emergency-fund" component={EmergencyFundPage} />
        <Route path="/heloc" component={HelocPage} />
        <Route path="/smith-maneuver" component={SmithManeuverPage} />
        <Route path="/notifications/preferences" component={NotificationPreferencesPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
