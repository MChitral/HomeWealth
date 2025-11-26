import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
import { Save, ArrowLeft, Info, Plus, Trash2, Edit2 } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { queryClient } from "@/shared/api/query-client";
import { MortgageBalanceChart } from "@/widgets/charts/mortgage-balance-chart";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import type { Scenario, PrepaymentEvent, InsertPrepaymentEvent } from "@shared/schema";
import { scenarioApi, scenarioQueryKeys, type ScenarioPayload } from "./api";
import { useScenarioDetail } from "./hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import { useCashFlowData } from "@/features/cash-flow/hooks";

type DraftPrepaymentEvent = {
  id: string;
  scenarioId: string;
  eventType: "annual" | "one-time";
  amount: string;
  startPaymentNumber: number;
  description: string | null;
  recurrenceMonth: number | null;
  oneTimeYear: number | null;
};

export function ScenarioEditorFeature() {
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const rawScenarioId = params.id;
  const isNewScenario = rawScenarioId === "new" || !rawScenarioId;
  const scenarioId = !isNewScenario && rawScenarioId ? rawScenarioId : null;
  const {
    scenario,
    prepaymentEvents: fetchedEvents,
    isLoading: detailLoading,
  } = useScenarioDetail(scenarioId);

  // Fetch real mortgage data from the database
  const { mortgage, terms, payments, isLoading: mortgageLoading } = useMortgageData();
  const { cashFlow, isLoading: cashFlowLoading } = useCashFlowData();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prepaymentSplit, setPrepaymentSplit] = useState([50]);
  const [expectedReturnRate, setExpectedReturnRate] = useState(6.0);
  const [efPriorityPercent, setEfPriorityPercent] = useState(0);
  
  // Prepayment events state
  const [prepaymentEvents, setPrepaymentEvents] = useState<DraftPrepaymentEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<DraftPrepaymentEvent | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Event form state
  const [eventType, setEventType] = useState<"annual" | "one-time">("annual");
  const [eventAmount, setEventAmount] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [recurrenceMonth, setRecurrenceMonth] = useState("3"); // March for tax refund
  const [oneTimeYear, setOneTimeYear] = useState("1");

  const pageTitle = isNewScenario ? "New Scenario | Mortgage Strategy" : "Edit Scenario | Mortgage Strategy";
  usePageTitle(pageTitle);

  // Initialize form when editing existing scenario
  useEffect(() => {
    if (scenario && !isNewScenario) {
      setName(scenario.name);
      setDescription(scenario.description || "");
      setPrepaymentSplit([scenario.prepaymentMonthlyPercent]);
      setExpectedReturnRate(parseFloat(scenario.expectedReturnRate));
      setEfPriorityPercent(scenario.efPriorityPercent);
    }
  }, [scenario, isNewScenario]);

  // Load prepayment events
  useEffect(() => {
    if (fetchedEvents) {
      setPrepaymentEvents(fetchedEvents.map(toDraftEvent));
    }
  }, [fetchedEvents]);

  const buildScenarioPayload = (): ScenarioPayload => {
    const prepaymentPercent = prepaymentSplit?.[0] ?? 50;
    return {
      name: name.trim(),
      description: description.trim() || null,
      prepaymentMonthlyPercent: prepaymentPercent,
      investmentMonthlyPercent: 100 - prepaymentPercent,
      expectedReturnRate: Number(parseFloat(expectedReturnRate.toString()).toFixed(3)),
      efPriorityPercent: Math.max(0, Math.min(100, efPriorityPercent)),
    };
  };

  const buildEventPayload = (
    event: DraftPrepaymentEvent,
    scenarioIdValue: string,
  ): InsertPrepaymentEvent => ({
    scenarioId: scenarioIdValue,
    eventType: event.eventType,
    amount: event.amount ?? "0",
    startPaymentNumber: event.startPaymentNumber ?? 1,
    recurrenceMonth: event.eventType === "annual" ? event.recurrenceMonth ?? null : null,
    oneTimeYear: event.eventType === "one-time" ? event.oneTimeYear ?? null : null,
    description: event.description ?? null,
  });

  const toDraftEvent = (event: PrepaymentEvent): DraftPrepaymentEvent => ({
    id: event.id,
    scenarioId: event.scenarioId,
    eventType: event.eventType as "annual" | "one-time",
    amount: event.amount,
    startPaymentNumber: event.startPaymentNumber ?? 1,
    description: event.description ?? null,
    recurrenceMonth: event.recurrenceMonth ?? null,
    oneTimeYear: event.oneTimeYear ?? null,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildScenarioPayload();
      const savedScenario = isNewScenario
        ? await scenarioApi.createScenario(payload)
        : await scenarioApi.updateScenario(scenarioId!, payload);

      if (isNewScenario && savedScenario?.id && prepaymentEvents.length > 0) {
        await Promise.all(
          prepaymentEvents.map((event) =>
            scenarioApi.createPrepaymentEvent(savedScenario.id!, buildEventPayload(event, savedScenario.id!)),
          ),
        );
      }

      return savedScenario;
    },
    onSuccess: (savedScenario: Scenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenariosWithMetrics() });
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all() });
      const id = savedScenario?.id ?? scenarioId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenario(id) });
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(id) });
      }
      toast({
        title: isNewScenario ? "Scenario created" : "Scenario saved",
        description: isNewScenario ? "Your new scenario has been created." : "Your scenario has been updated.",
      });
      
      // Navigate to scenarios list after saving
      navigate("/scenarios");
    },
    onError: () => {
      toast({
        title: "Error saving scenario",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a scenario name.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  // Prepayment event management
  const handleAddEvent = async () => {
    if (!eventAmount || parseFloat(eventAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid prepayment amount.",
        variant: "destructive",
      });
      return;
    }

    const eventData: DraftPrepaymentEvent = {
      id: `temp-${Date.now()}`,
      scenarioId: scenarioId || "",
      eventType,
      amount: parseFloat(eventAmount).toFixed(2),
      startPaymentNumber: 1,
      description: eventDescription || null,
      recurrenceMonth: eventType === "annual" ? parseInt(recurrenceMonth) : null,
      oneTimeYear: eventType === "one-time" ? parseInt(oneTimeYear) : null,
    };

    // For existing scenarios, save to API immediately
    if (!isNewScenario && scenarioId) {
      try {
        const savedEvent = await scenarioApi.createPrepaymentEvent(
          scenarioId,
          buildEventPayload(eventData, scenarioId),
        );
        setPrepaymentEvents([...prepaymentEvents, toDraftEvent(savedEvent)]);
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(scenarioId) });
        toast({
          title: "Event added",
          description: "Prepayment event has been saved.",
        });
      } catch (error) {
        toast({
          title: "Error adding event",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For new scenarios, just add to local state (will be saved when scenario is created)
      setPrepaymentEvents([...prepaymentEvents, eventData]);
    }

    setIsAddingEvent(false);
    resetEventForm();
  };

  const handleEditEvent = (event: DraftPrepaymentEvent) => {
    setEditingEvent(event);
    setEventType(event.eventType as "annual" | "one-time");
    setEventAmount(event.amount);
    setEventDescription(event.description || "");
    if (event.eventType === "annual" && event.recurrenceMonth) {
      setRecurrenceMonth(event.recurrenceMonth.toString());
    } else if (event.eventType === "one-time" && event.oneTimeYear) {
      setOneTimeYear(event.oneTimeYear.toString());
    }
    setIsAddingEvent(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !eventAmount || parseFloat(eventAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid prepayment amount.",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent: DraftPrepaymentEvent = {
      ...editingEvent,
      eventType,
      amount: parseFloat(eventAmount).toFixed(2),
      description: eventDescription || null,
      recurrenceMonth: eventType === "annual" ? parseInt(recurrenceMonth) : null,
      oneTimeYear: eventType === "one-time" ? parseInt(oneTimeYear) : null,
    };

    // For existing scenarios with real event IDs, update via API
    if (!isNewScenario && scenarioId && !editingEvent.id.startsWith("temp-")) {
      try {
        await scenarioApi.updatePrepaymentEvent(
          editingEvent.id,
          buildEventPayload(updatedEvent, scenarioId),
        );
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(scenarioId) });
        toast({
          title: "Event updated",
          description: "Prepayment event has been saved.",
        });
      } catch (error) {
        toast({
          title: "Error updating event",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setPrepaymentEvents(
      prepaymentEvents.map((e) => (e.id === editingEvent.id ? updatedEvent : e))
    );
    setIsAddingEvent(false);
    setEditingEvent(null);
    resetEventForm();
  };

  const handleDeleteEvent = async (eventId: string) => {
    // For existing scenarios with real event IDs, delete via API
    if (!isNewScenario && scenarioId && !eventId.startsWith("temp-")) {
      try {
        await scenarioApi.deletePrepaymentEvent(eventId);
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(scenarioId) });
        toast({
          title: "Event deleted",
          description: "Prepayment event has been removed.",
        });
      } catch (error) {
        toast({
          title: "Error deleting event",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setPrepaymentEvents(prepaymentEvents.filter((e) => e.id !== eventId));
  };

  const resetEventForm = () => {
    setEventType("annual");
    setEventAmount("");
    setEventDescription("");
    setRecurrenceMonth("3");
    setOneTimeYear("1");
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  // Get latest term and latest payment for current mortgage position (sorted by date)
  const sortedTerms = useMemo(() => {
    if (!terms?.length) return [];
    return [...terms].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [terms]);
  const latestTerm = sortedTerms[0] || null;

  const sortedPayments = useMemo(() => {
    if (!payments?.length) return [];
    return [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments]);
  const latestPayment = sortedPayments[0] || null;
  const firstPayment = sortedPayments[sortedPayments.length - 1] || null;

  // Calculate totals from payment history
  const totalPrincipalPaid = payments?.reduce((sum, p) => sum + Number(p.principalPaid || 0), 0) || 0;
  const totalInterestPaid = payments?.reduce((sum, p) => sum + Number(p.interestPaid || 0), 0) || 0;

  // Calculate years into mortgage from first payment
  const yearsIntoMortgage = firstPayment 
    ? (new Date().getTime() - new Date(firstPayment.paymentDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
    : 0;

  // Current mortgage data from database
  const currentMortgageData = useMemo(() => ({
    homeValue: Number(mortgage?.propertyPrice || 500000),
    originalPrincipal: Number(mortgage?.originalAmount || 400000),
    currentBalance: latestPayment 
      ? Number(latestPayment.remainingBalance) 
      : Number(mortgage?.currentBalance || 400000),
    principalPaid: Math.round(totalPrincipalPaid * 100) / 100,
    interestPaid: Math.round(totalInterestPaid * 100) / 100,
    yearsIntoMortgage: Math.round(yearsIntoMortgage * 100) / 100,
    currentRate: latestPayment 
      ? Number(latestPayment.effectiveRate) 
      : Number(latestTerm?.fixedRate || latestTerm?.lockedSpread || 5.0),
    currentAmortization: latestPayment 
      ? Math.round((Number(latestPayment.remainingAmortizationMonths) / 12) * 10) / 10
      : Number(mortgage?.amortizationYears || 25),
    monthlyPayment: latestPayment 
      ? Number(latestPayment.regularPaymentAmount)
      : Number(latestTerm?.regularPaymentAmount || 2000),
    termType: latestTerm?.termType === "fixed" 
      ? "Fixed Rate" 
      : latestTerm?.termType === "variable-fixed" 
        ? "Variable-Fixed Payment" 
        : "Variable-Changing Payment",
    lockedSpread: Number(latestTerm?.lockedSpread || 0),
  }), [mortgage, latestTerm, latestPayment, totalPrincipalPaid, totalInterestPaid, yearsIntoMortgage]);

  // Calculate monthly expenses from all expense fields
  const monthlyExpenses = useMemo(() => {
    if (!cashFlow) return 0;
    return (
      Number(cashFlow.propertyTax || 0) +
      Number(cashFlow.homeInsurance || 0) +
      Number(cashFlow.condoFees || 0) +
      Number(cashFlow.utilities || 0) +
      Number(cashFlow.groceries || 0) +
      Number(cashFlow.dining || 0) +
      Number(cashFlow.transportation || 0) +
      Number(cashFlow.entertainment || 0) +
      Number(cashFlow.carLoan || 0) +
      Number(cashFlow.studentLoan || 0) +
      Number(cashFlow.creditCard || 0)
    );
  }, [cashFlow]);

  // Calculate surplus cash from cash flow
  const monthlySurplus = useMemo(() => {
    if (!cashFlow) return 0;
    const income = Number(cashFlow.monthlyIncome || 0);
    const mortgagePayment = currentMortgageData.monthlyPayment;
    return Math.max(0, income - monthlyExpenses - mortgagePayment);
  }, [cashFlow, monthlyExpenses, currentMortgageData.monthlyPayment]);

  // Calculate dynamic mortgage projection based on prepayment split
  const { mortgageProjection, projectedPayoff, totalInterest, interestSaved } = useMemo(() => {
    const balance = currentMortgageData.currentBalance;
    const rate = currentMortgageData.currentRate / 100;
    const monthlyRate = rate / 12;
    const basePayment = currentMortgageData.monthlyPayment;
    const prepayPercent = prepaymentSplit[0] / 100;
    const monthlyPrepay = monthlySurplus * prepayPercent;
    const totalMonthlyPayment = basePayment + monthlyPrepay;

    // Calculate annual prepayment events total
    const annualPrepayEvents = prepaymentEvents
      .filter(e => e.eventType === "annual")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Generate projection data
    const projection: { year: number; balance: number; principal: number; interest: number }[] = [];
    let runningBalance = balance;
    let totalPrincipal = 0;
    let totalInterestCalc = 0;
    let monthsToPayoff = 0;

    for (let month = 0; month <= 360 && runningBalance > 0; month++) {
      if (month % 24 === 0) { // Every 2 years
        projection.push({
          year: month / 12,
          balance: Math.round(runningBalance),
          principal: Math.round(totalPrincipal),
          interest: Math.round(totalInterestCalc),
        });
      }

      if (runningBalance <= 0) break;

      const interestPayment = runningBalance * monthlyRate;
      let principalPayment = totalMonthlyPayment - interestPayment;

      // Add annual prepayment in month 3 (March)
      if (month > 0 && month % 12 === 2) {
        principalPayment += annualPrepayEvents;
      }

      principalPayment = Math.min(principalPayment, runningBalance);
      runningBalance -= principalPayment;
      totalPrincipal += principalPayment;
      totalInterestCalc += interestPayment;
      monthsToPayoff = month + 1;
    }

    // Ensure we have at least the final data point
    if (projection.length === 0 || projection[projection.length - 1].balance > 0) {
      projection.push({
        year: Math.ceil(monthsToPayoff / 12),
        balance: 0,
        principal: Math.round(totalPrincipal),
        interest: Math.round(totalInterestCalc),
      });
    }

    // Calculate baseline (no prepayment) for comparison
    let baselineInterest = 0;
    let baselineBalance = balance;
    for (let month = 0; month <= 360 && baselineBalance > 0; month++) {
      const interestPayment = baselineBalance * monthlyRate;
      const principalPayment = Math.min(basePayment - interestPayment, baselineBalance);
      baselineBalance -= principalPayment;
      baselineInterest += interestPayment;
    }

    return {
      mortgageProjection: projection,
      projectedPayoff: Math.round(monthsToPayoff / 12 * 10) / 10,
      totalInterest: Math.round(totalInterestCalc),
      interestSaved: Math.round(baselineInterest - totalInterestCalc),
    };
  }, [currentMortgageData, prepaymentSplit, monthlySurplus, prepaymentEvents]);

  // Show loading skeleton when editing existing scenario or loading mortgage data
  if ((detailLoading && !isNewScenario) || mortgageLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-10 w-60 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-4 -mt-4">
        <Link href="/scenarios">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">{isNewScenario ? "New Scenario" : "Edit Scenario"}</h1>
          <p className="text-muted-foreground">Build a strategy from your current mortgage position</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          data-testid="button-save"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Scenario"}
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your current mortgage data is pre-loaded from Mortgage History. Projections start from today's position.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="scenario-name">Scenario Name</Label>
          <Input
            id="scenario-name"
            placeholder="e.g., Balanced Strategy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="input-scenario-name"
          />
        </div>
        <div>
          <Label htmlFor="scenario-description">Description (Optional)</Label>
          <Input
            id="scenario-description"
            placeholder="Brief description of this strategy"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="input-scenario-description"
          />
        </div>
        <div>
          <Label htmlFor="horizon">Projection Horizon (years)</Label>
          <Select defaultValue="10">
            <SelectTrigger id="horizon" data-testid="select-horizon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Years</SelectItem>
              <SelectItem value="15">15 Years</SelectItem>
              <SelectItem value="20">20 Years</SelectItem>
              <SelectItem value="25">25 Years</SelectItem>
              <SelectItem value="30">30 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> Income and expenses are configured in the{" "}
            <Link href="/cash-flow" className="text-primary hover:underline">
              Cash Flow page
            </Link>{" "}
            and apply to all scenarios. Here you only configure what differs between strategies.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mortgage" data-testid="tab-mortgage">Mortgage & Prepayment</TabsTrigger>
          <TabsTrigger value="ef" data-testid="tab-ef">Emergency Fund</TabsTrigger>
          <TabsTrigger value="investments" data-testid="tab-investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="mortgage" className="space-y-6">
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle>Current Mortgage Position</CardTitle>
              <CardDescription>Loaded from your Mortgage History (as of latest payment)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Home Value</p>
                  <p className="text-lg font-mono font-semibold">${currentMortgageData.homeValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-lg font-mono font-semibold">${currentMortgageData.currentBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Years Into Mortgage</p>
                  <p className="text-lg font-mono font-semibold">{currentMortgageData.yearsIntoMortgage} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
                  <p className="text-lg font-mono font-semibold">{currentMortgageData.currentRate}%</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Principal Paid So Far</p>
                  <p className="text-base font-mono text-green-600">${currentMortgageData.principalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Interest Paid So Far</p>
                  <p className="text-base font-mono text-orange-600">${currentMortgageData.interestPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Amortization</p>
                  <p className="text-base font-mono">{currentMortgageData.currentAmortization} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                  <p className="text-base font-mono">${currentMortgageData.monthlyPayment.toLocaleString()}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Term Type</p>
                  <p className="text-base font-medium">{currentMortgageData.termType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Locked Spread</p>
                  <p className="text-base font-mono">Prime {currentMortgageData.lockedSpread >= 0 ? '+' : ''}{currentMortgageData.lockedSpread}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Future Rate Assumptions</CardTitle>
              <CardDescription>Model how rates might change over the projection period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate-scenario">Rate Change Scenario</Label>
                <Select defaultValue="current">
                  <SelectTrigger id="rate-scenario" data-testid="select-rate-scenario">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current rate stays constant</SelectItem>
                    <SelectItem value="decrease-slow">Slow decrease (0.25% per year)</SelectItem>
                    <SelectItem value="decrease-fast">Fast decrease (0.50% per year)</SelectItem>
                    <SelectItem value="increase-slow">Slow increase (0.25% per year)</SelectItem>
                    <SelectItem value="increase-fast">Fast increase (0.50% per year)</SelectItem>
                    <SelectItem value="custom">Custom rate schedule</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  For variable mortgages, this affects Prime rate changes. Your spread ({currentMortgageData.lockedSpread}%) stays locked until term renewal.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term-renewal">At Next Term Renewal (future)</Label>
                <Select defaultValue="same">
                  <SelectTrigger id="term-renewal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Keep same spread</SelectItem>
                    <SelectItem value="better">Negotiate better spread (-0.10%)</SelectItem>
                    <SelectItem value="worse">Worse spread (+0.10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appreciation-rate">Property Appreciation Rate (% annual)</Label>
                <Input id="appreciation-rate" type="number" step="0.1" defaultValue="2.0" data-testid="input-appreciation-rate" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prepayment Events</CardTitle>
                  <CardDescription>Annual lump sums (bonuses, tax refunds) and one-time prepayments</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetEventForm();
                    setIsAddingEvent(true);
                    setEditingEvent(null);
                  }}
                  data-testid="button-add-event"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* List of existing prepayment events */}
              {prepaymentEvents.length === 0 && !isAddingEvent && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No prepayment events configured. Add annual lump sums (like tax refunds) or one-time prepayments (like inheritances).
                  </AlertDescription>
                </Alert>
              )}

              {prepaymentEvents.length > 0 && (
                <div className="space-y-3">
                  {prepaymentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/30"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" data-testid={`badge-${event.eventType}`}>
                            {event.eventType === "annual" ? "Annual" : "One-Time"}
                          </Badge>
                          <span className="font-mono font-semibold text-lg">
                            ${parseFloat(event.amount).toLocaleString()}
                          </span>
                        </div>
                        {event.eventType === "annual" && event.recurrenceMonth && (
                          <p className="text-sm text-muted-foreground">
                            Every {getMonthName(event.recurrenceMonth)}
                          </p>
                        )}
                        {event.eventType === "one-time" && event.oneTimeYear && (
                          <p className="text-sm text-muted-foreground">
                            Year {event.oneTimeYear} from mortgage start
                          </p>
                        )}
                        {event.description && (
                          <p className="text-sm mt-1">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEvent(event)}
                          data-testid={`button-edit-${event.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                          data-testid={`button-delete-${event.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Event Form */}
              {isAddingEvent && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingEvent ? "Edit Prepayment Event" : "Add Prepayment Event"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-type">Event Type</Label>
                      <Select
                        value={eventType}
                        onValueChange={(value) => setEventType(value as "annual" | "one-time")}
                      >
                        <SelectTrigger id="event-type" data-testid="select-event-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual">Annual (recurring every year)</SelectItem>
                          <SelectItem value="one-time">One-Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-amount">Amount ($)</Label>
                      <Input
                        id="event-amount"
                        type="number"
                        placeholder="5000"
                        value={eventAmount}
                        onChange={(e) => setEventAmount(e.target.value)}
                        data-testid="input-event-amount"
                      />
                    </div>

                    {eventType === "annual" && (
                      <div className="space-y-2">
                        <Label htmlFor="recurrence-month">Which Month?</Label>
                        <Select
                          value={recurrenceMonth}
                          onValueChange={setRecurrenceMonth}
                        >
                          <SelectTrigger id="recurrence-month" data-testid="select-recurrence-month">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">January</SelectItem>
                            <SelectItem value="2">February</SelectItem>
                            <SelectItem value="3">March (Tax Refund)</SelectItem>
                            <SelectItem value="4">April</SelectItem>
                            <SelectItem value="5">May</SelectItem>
                            <SelectItem value="6">June</SelectItem>
                            <SelectItem value="7">July</SelectItem>
                            <SelectItem value="8">August</SelectItem>
                            <SelectItem value="9">September</SelectItem>
                            <SelectItem value="10">October</SelectItem>
                            <SelectItem value="11">November</SelectItem>
                            <SelectItem value="12">December (Bonus)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Common: March for tax refunds, December for year-end bonuses
                        </p>
                      </div>
                    )}

                    {eventType === "one-time" && (
                      <div className="space-y-2">
                        <Label htmlFor="one-time-year">Which Year? (from mortgage start)</Label>
                        <Input
                          id="one-time-year"
                          type="number"
                          min="1"
                          placeholder="1"
                          value={oneTimeYear}
                          onChange={(e) => setOneTimeYear(e.target.value)}
                          data-testid="input-one-time-year"
                        />
                        <p className="text-sm text-muted-foreground">
                          E.g., "5" means 5 years from when your mortgage started
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description (Optional)</Label>
                      <Input
                        id="event-description"
                        placeholder="e.g., Annual bonus, Tax refund, Inheritance"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        data-testid="input-event-description"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                        data-testid="button-save-event"
                      >
                        {editingEvent ? "Update Event" : "Add Event"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingEvent(false);
                          setEditingEvent(null);
                          resetEventForm();
                        }}
                        data-testid="button-cancel-event"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Label htmlFor="split-slider">Surplus Cash Allocation</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Monthly surplus: <span className="font-mono font-medium text-foreground">${monthlySurplus.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        {!cashFlow && <span className="text-orange-500 ml-2">(Set up Cash Flow to calculate)</span>}
                      </p>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {prepaymentSplit[0]}% / {100 - prepaymentSplit[0]}%
                    </span>
                  </div>
                  <Slider
                    id="split-slider"
                    min={0}
                    max={100}
                    step={5}
                    value={prepaymentSplit}
                    onValueChange={setPrepaymentSplit}
                    data-testid="slider-split"
                  />
                  <div className="flex justify-between text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-primary">Mortgage Prepay</p>
                      <p className="font-mono text-lg">${Math.round(monthlySurplus * prepaymentSplit[0] / 100).toLocaleString()}<span className="text-muted-foreground text-sm">/mo</span></p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="font-medium text-chart-2">Investments</p>
                      <p className="font-mono text-lg">${Math.round(monthlySurplus * (100 - prepaymentSplit[0]) / 100).toLocaleString()}<span className="text-muted-foreground text-sm">/mo</span></p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    How to split surplus cash (after EF is full) between mortgage prepayment and investments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Projected Mortgage Outcome</CardTitle>
              <CardDescription>
                Based on current prepayment strategy
                {prepaymentEvents.length > 0 && ` (${prepaymentEvents.length} prepayment ${prepaymentEvents.length === 1 ? 'event' : 'events'})`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-primary/10 rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Projected Payoff</p>
                  <p className="text-2xl font-bold font-mono">{projectedPayoff} years</p>
                  <p className="text-xs text-muted-foreground">from today</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Interest (future)</p>
                  <p className="text-2xl font-bold font-mono">${totalInterest.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">from today forward</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Interest Saved</p>
                  <p className="text-2xl font-bold font-mono text-green-600">${interestSaved.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">vs minimum payments</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-3">Mortgage Balance Projection (from today)</p>
                <MortgageBalanceChart data={mortgageProjection} />
              </div>
              <p className="text-sm text-muted-foreground italic">
                Adjust prepayment settings above to see how they affect your mortgage payoff timeline
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ef" className="space-y-6">
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle>Emergency Fund Target</CardTitle>
              <CardDescription>Configured on Emergency Fund page (applies to all scenarios)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Current Target</p>
                <p className="text-2xl font-mono font-bold mb-2">$30,000</p>
                <p className="text-sm text-muted-foreground">
                  = 6 months of expenses
                </p>
                <Link href="/emergency-fund">
                  <Button variant="outline" size="sm" className="mt-3" data-testid="button-edit-ef-target">
                    Edit Target
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Fund Strategy</CardTitle>
              <CardDescription>Configure how this scenario fills the emergency fund</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ef-contribution">Monthly Contribution</Label>
                <Input 
                  id="ef-contribution" 
                  type="number" 
                  placeholder="500" 
                  defaultValue="500"
                  data-testid="input-ef-contribution" 
                />
                <p className="text-sm text-muted-foreground">
                  How much to contribute each month until target is reached
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="ef-reroute">After Target is Reached, Redirect To:</Label>
                <Select defaultValue="split">
                  <SelectTrigger id="ef-reroute" data-testid="select-ef-reroute">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Split per Surplus Allocation (recommended)</SelectItem>
                    <SelectItem value="investments">100% to Investments</SelectItem>
                    <SelectItem value="prepay">100% to Mortgage Prepayment</SelectItem>
                    <SelectItem value="none">None (save as cash)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  "Split" option uses the Surplus Allocation slider from Mortgage tab
                </p>
              </div>

              <Separator />

              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-2">Timeline Estimate</p>
                <p className="text-sm text-muted-foreground">
                  At $500/month contribution, emergency fund will be fully funded in <span className="font-mono font-semibold">60 months (5 years)</span>.
                  After that, this $500/month will be redirected according to your selection above.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Configuration</CardTitle>
              <CardDescription>Plan your investment growth (TFSA, RRSP, non-registered)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-contribution">Base Monthly Contribution</Label>
                <Input id="base-contribution" type="number" placeholder="1000" data-testid="input-base-contribution" />
                <p className="text-sm text-muted-foreground">Fixed amount invested each month</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual-return">Expected Annual Return (%)</Label>
                <Input 
                  id="annual-return" 
                  type="number" 
                  step="0.1" 
                  value={expectedReturnRate}
                  onChange={(e) => setExpectedReturnRate(parseFloat(e.target.value) || 0)}
                  placeholder="6.0" 
                  data-testid="input-annual-return" 
                />
                <p className="text-sm text-muted-foreground">Historical average: 6-8% for balanced portfolio</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compounding">Compounding Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="compounding" data-testid="select-compounding">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-2">Additional Investment Sources</p>
                <p className="text-sm text-muted-foreground">
                  After Emergency Fund is full, surplus cash is split between investments and mortgage prepayment 
                  based on the allocation slider in the Mortgage tab.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
