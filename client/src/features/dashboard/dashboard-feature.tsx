import { useMemo } from "react";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { QueryErrorState } from "@/shared/components";
import { usePageTitle } from "@/shared/hooks/use-page-title";

import { useMortgageSelection } from "@/features/mortgage-tracking";
import { MortgageSelector } from "@/features/mortgage-tracking/components/mortgage-selector";
import { useDashboardData, useDashboardCalculations } from "./hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import { useTriggerStatus } from "@/features/mortgage-tracking/hooks/use-trigger-status";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { HealthScoreCard } from "@/features/mortgage-tracking/components/health-score-card";

import type { PaymentFrequency } from "@/features/mortgage-tracking/utils/mortgage-math";

import { AlertBanner } from "./components/alert-banner";
import { RateChangeAlert } from "./components/rate-change-alert";
import { RenewalCard } from "./components/renewal-card";
import { RefinanceScenarioCard } from "./components/refinance-card";

import {
  DashboardSkeleton,
  EmptyWidgetState,
  PrepaymentCard,
  WealthHero,
  ActivityFeed,
  type ActivityItem,
} from "./components";

export function DashboardFeature() {
  usePageTitle("Dashboard | Mortgage Strategy");

  const { selectedMortgageId, setSelectedMortgageId, mortgages, selectedMortgage } =
    useMortgageSelection();
  const {
    scenarios,
    emergencyFund,
    cashFlow,
    isLoading,
    isError: dashboardError,
    refetchAll: refetchDashboard,
  } = useDashboardData();
  const {
    mortgage: detailedMortgage,
    terms,
    payments,
    isLoading: mortgageDataLoading,
    isError: mortgageDataError,
    refetch: refetchMortgageData,
  } = useMortgageData(selectedMortgageId);

  const activeMortgage = detailedMortgage ?? selectedMortgage ?? null;
  const dashboardPaymentFrequency: PaymentFrequency = "monthly";

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
    efBalance,
  } = useDashboardCalculations({
    activeMortgage,
    latestTerm,
    latestPayment,
    emergencyFund: emergencyFund ?? null,
    cashFlow: cashFlow ?? null,
    paymentFrequency: dashboardPaymentFrequency,
  });

  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

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
          amount: `$${(Number(p.principalPaid) + Number(p.interestPaid)).toFixed(2)}`,
          originalDate: new Date(p.paymentDate),
        });
      });
    }

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
          amount: `${(Number(t.fixedRate || t.lockedSpread || 0)).toFixed(2)}%`,
          originalDate: new Date(t.startDate),
        });
      });
    }

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

    return items
      .sort((a, b) => {
        const dateA = a.originalDate?.getTime() || 0;
        const dateB = b.originalDate?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [payments, terms, scenarios]);

  if (isLoading || mortgageDataLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardError || mortgageDataError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Mortgage health overview" />
        <QueryErrorState
          onRetry={() => {
            refetchDashboard();
            refetchMortgageData();
          }}
        />
      </div>
    );
  }

  const showNoMortgage = !mortgages || mortgages.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Mortgage health overview"
      />

      <WealthHero
        netWorth={homeValue - mortgageBalance + (efBalance || 0)}
        homeValue={homeValue}
        mortgageBalance={mortgageBalance}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            {latestImpact && <RateChangeAlert impact={latestImpact} newPrimeRate={7.45} />}

            {triggerStatus && (triggerStatus.isHit || triggerStatus.isRisk) && !latestImpact && (
              <AlertBanner alert={triggerStatus} />
            )}

            <div className="lg:w-[340px]">
              {showNoMortgage ? (
                <div className="p-4 border rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">No mortgages found.</p>
                  <Link href="/mortgage">
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-add-mortgage">
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

        <div className="md:col-span-1">
          <ActivityFeed items={activities} />
        </div>
      </div>
    </div>
  );
}
