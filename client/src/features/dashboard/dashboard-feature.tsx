import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { Separator } from "@/shared/ui/separator";
import { toast } from "@/shared/hooks/use-toast";

import { useMortgageSelection } from "@/features/mortgage-tracking";
import { MortgageSelector } from "@/features/mortgage-tracking/components/mortgage-selector";
import { useDashboardData, useDashboardCalculations, useDashboardCharts } from "./hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import { useTriggerStatus } from "@/features/mortgage-tracking/hooks/use-trigger-status";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { HealthScoreCard } from "@/features/mortgage-tracking/components/health-score-card";

import type { PaymentFrequency } from "@/features/mortgage-tracking/utils/mortgage-math";
import type { ScenarioWithMetrics } from "@/entities";

import { AlertBanner } from "./components/alert-banner";
import { RateChangeAlert } from "./components/rate-change-alert";
import { RenewalCard } from "./components/renewal-card";
import { RefinanceScenarioCard } from "./components/refinance-card";

// ... (imports)

// ... inside component ...

import {
  DashboardSkeleton,
  DashboardEmptyState,
  ProjectionsHeader,
  ScenarioMetricsCards,
  MortgageDetailsCard,
  NetWorthProjectionCard,
  InvestmentGrowthCard,
  StrategySummaryCard,
  EmptyWidgetState,
  PrepaymentCard,
  WealthHero,
  ActionCenter,
  ActivityFeed,
  type ActivityItem,
} from "./components";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HORIZONS = [10, 20, 30] as const;
type Horizon = (typeof HORIZONS)[number];

export function DashboardFeature() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>(10);

  usePageTitle("Dashboard | Mortgage Strategy");
  const queryClient = useQueryClient();

  // 1. Core Data Hooks
  const { selectedMortgageId, setSelectedMortgageId, mortgages, selectedMortgage } =
    useMortgageSelection();
  const { scenarios, emergencyFund, cashFlow, isLoading } = useDashboardData();
  const {
    mortgage: detailedMortgage,
    terms,
    payments,
    isLoading: mortgageDataLoading,
  } = useMortgageData(selectedMortgageId);

  const activeMortgage = detailedMortgage ?? selectedMortgage ?? null;
  const dashboardPaymentFrequency: PaymentFrequency = "monthly";

  // 2. Alert Hooks
  const { triggerStatus } = useTriggerStatus(activeMortgage?.id ?? null);

  const { data: latestImpact } = useQuery({
    queryKey: ["impact", activeMortgage?.id],
    queryFn: () => (activeMortgage ? mortgageApi.fetchLatestImpact(activeMortgage.id) : null),
    enabled: !!activeMortgage,
  });

  const { data: renewalStatus } = useQuery({
    queryKey: ["renewal", activeMortgage?.id],
    queryFn: () => (activeMortgage ? mortgageApi.fetchRenewalStatus(activeMortgage.id) : null),
    enabled: !!activeMortgage,
  });

  const { data: refinanceAnalysis } = useQuery({
    queryKey: ["refinance", activeMortgage?.id],
    queryFn: () => (activeMortgage ? mortgageApi.fetchRefinanceAnalysis(activeMortgage.id) : null),
    enabled: !!activeMortgage,
  });

  // 3. Simulation (MVP Tool)
  const simulateChangeMutation = useMutation({
    mutationFn: (payload: { oldRate: number; newRate: number }) =>
      mortgageApi.calculateImpacts(payload),
    onSuccess: (data) => {
      toast({
        title: "Simulation Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["impact"] });
    },
  });

  // 4. Action Buttons
  const newScenarioAction = (
    <Link href="/scenarios/new">
      <Button data-testid="button-new-scenario">
        <Plus className="h-4 w-4 mr-2" />
        New Scenario
      </Button>
    </Link>
  );

  // 5. Effects
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (scenarios && scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  // 6. Memoized Calculations
  const sortedTerms = useMemo(() => {
    if (!terms?.length) return [];
    return [...terms].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [terms]);
  const latestTerm = sortedTerms[0] || null;

  const sortedPayments = useMemo(() => {
    if (!payments?.length) return [];
    return [...payments].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }, [payments]);
  const latestPayment = sortedPayments[0] || null;

  const {
    homeValue,
    mortgageBalance,
    originalMortgageBalance: _originalMortgageBalance,
    efBalance,
    efTargetAmount: _efTargetAmount,
    paymentPreview: _paymentPreview,
  } = useDashboardCalculations({
    activeMortgage,
    latestTerm,
    latestPayment,
    emergencyFund: emergencyFund ?? null,
    cashFlow: cashFlow ?? null,
    paymentFrequency: dashboardPaymentFrequency,
  });

  const selectedScenario = scenarios?.find((s) => s.id === selectedScenarioId);
  const getMetricForHorizon = (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns"
  ) => {
    if (!scenario?.metrics) return 0;
    const key = `${metric}${selectedHorizon}yr` as keyof ScenarioWithMetrics["metrics"];
    return Number(scenario.metrics[key] || 0);
  };

  const { netWorthChartData, mortgageChartData, investmentChartData } = useDashboardCharts({
    activeMortgage,
    netWorthProjections: selectedScenario?.metrics?.netWorthProjections,
    mortgageBalanceProjections: selectedScenario?.metrics?.mortgageBalanceProjections,
    investmentProjections: selectedScenario?.metrics?.investmentProjections,
  });

  // 7. Activity Feed Data Mapping
  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    // Map Payments
    if (payments) {
      payments.forEach((p) => {
        items.push({
          id: `pay-${p.id}`,
          type: "payment",
          title: "Mortgage Payment",
          date: new Date(p.paymentDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          amount: `$${(Number(p.principal) + Number(p.interest)).toFixed(2)}`,
          originalDate: new Date(p.paymentDate),
        });
      });
    }

    // Map Rate Changes (Terms)
    if (terms) {
      terms.forEach((t) => {
        items.push({
          id: `term-${t.id}`,
          type: "rate_change",
          title: "Rate/Term Update",
          date: new Date(t.startDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          amount: `${(Number(t.interestRate) * 100).toFixed(2)}%`,
          originalDate: new Date(t.startDate),
        });
      });
    }

    // Map Scenarios
    if (scenarios) {
      scenarios.forEach((s) => {
        items.push({
          id: `scen-${s.id}`,
          type: "scenario",
          title: "New Scenario",
          date: new Date(s.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          amount: s.name,
          originalDate: new Date(s.createdAt),
        });
      });
    }

    // Sort by date descending
    return items
      .sort((a, b) => {
        const dateA = a.originalDate?.getTime() || 0;
        const dateB = b.originalDate?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10); // Limit to top 10
  }, [payments, terms, scenarios]);

  // 7. Loading States
  if (isLoading || mortgageDataLoading) {
    return <DashboardSkeleton />;
  }

  // 8. Empty States Handling (Non-blocking now)
  const showEmptyState = !scenarios || scenarios.length === 0;
  const showNoMortgage = !mortgages || mortgages.length === 0;

  // 9. Main Render
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your financial overview and projections"
        className="mb-8"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateChangeMutation.mutate({ oldRate: 7.2, newRate: 7.45 })}
              disabled={simulateChangeMutation.isPending || !activeMortgage}
            >
              {simulateChangeMutation.isPending ? "Simulating..." : "Test Rate Hike (+0.25%)"}
            </Button>
            {newScenarioAction}
          </div>
        }
      />

      {/* NEW: Wealth Command Center Layout */}

      {/* 1. Hero Summary - Net Worth Focus */}
      <WealthHero
        netWorth={
          selectedScenario?.metrics?.netWorth10yr
            ? Number(selectedScenario.metrics.netWorth10yr)
            : homeValue - mortgageBalance + (efBalance || 0)
        }
        homeValue={homeValue}
        mortgageBalance={mortgageBalance}
      />

      {/* 2. Action Center - Quick Actions */}
      <ActionCenter
        onLogPayment={() => {
          // Ideally opens LogPaymentDialog. For MVP, we'll toast or link.
          toast({
            title: "Quick Action",
            description: "Use the Mortgage tab to log payments for now.",
          });
          // In Phase 2: Open dialog here.
        }}
        onUpdateRate={() => {
          toast({
            title: "Quick Action",
            description: "Use the Mortgage tab to update rates for now.",
          });
        }}
      />

      {/* 3. Main Grid: Health/Status (Left) vs Activity (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (2/3): Monitoring & Widgets */}
        <div className="md:col-span-2 space-y-8">
          {/* Alerts Section (Moved inside main column) */}
          <div className="space-y-4">
            {latestImpact && <RateChangeAlert impact={latestImpact} newPrimeRate={7.45} />}

            {triggerStatus && (triggerStatus.isHit || triggerStatus.isRisk) && !latestImpact && (
              <AlertBanner alert={triggerStatus} />
            )}

            {/* Mortgage Selector if needed, or hide if single mortgage */}
            <div className="lg:w-[340px]">
              {showNoMortgage ? (
                <div className="p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">No mortgages found.</p>
                  <Link href="/mortgages/new">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Mortgage
                    </Button>
                  </Link>
                </div>
              ) : (
                <MortgageSelector
                  mortgages={mortgages || []}
                  selectedMortgageId={selectedMortgageId}
                  onSelectMortgage={(id) => setSelectedMortgageId(id)}
                  onCreateNew={() => {}}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeMortgage && <HealthScoreCard mortgageId={activeMortgage.id} />}

            {renewalStatus ? (
              <RenewalCard status={renewalStatus} />
            ) : (
              <EmptyWidgetState
                title="Renewal Analysis"
                description="Add a mortgage to track your renewal timeline."
                actionUrl="/mortgages/new"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {refinanceAnalysis ? (
              <RefinanceScenarioCard analysis={refinanceAnalysis} />
            ) : (
              <EmptyWidgetState
                title="Refinance Opportunities"
                description="See how much you could save by refinancing."
                actionUrl="/mortgages/new"
              />
            )}
            {activeMortgage && <PrepaymentCard mortgageId={activeMortgage.id} />}
          </div>
        </div>

        {/* Right Column (1/3): Activity Feed */}
        <div className="md:col-span-1">
          <ActivityFeed items={activities} />
        </div>
      </div>

      <Separator />

      <ProjectionsHeader
        selectedHorizon={selectedHorizon}
        setSelectedHorizon={setSelectedHorizon}
        selectedScenarioId={selectedScenarioId}
        setSelectedScenarioId={setSelectedScenarioId}
        scenarios={scenarios || []}
      />

      {showEmptyState ? (
        <DashboardEmptyState />
      ) : (
        selectedScenario?.metrics && (
          <>
            <ScenarioMetricsCards
              selectedScenario={selectedScenario}
              selectedHorizon={selectedHorizon}
              getMetricForHorizon={getMetricForHorizon}
            />

            <MortgageDetailsCard
              selectedScenario={selectedScenario}
              mortgageChartData={mortgageChartData}
            />

            <NetWorthProjectionCard
              selectedScenario={selectedScenario}
              netWorthChartData={netWorthChartData}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InvestmentGrowthCard investmentChartData={investmentChartData} />
              <StrategySummaryCard
                selectedScenario={selectedScenario}
                getMetricForHorizon={getMetricForHorizon}
              />
            </div>
          </>
        )
      )}
    </div>
  );
}
