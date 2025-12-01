import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { useToast } from "@/shared/hooks/use-toast";
import {
  mortgageApi,
  mortgageQueryKeys,
  type CreatePaymentPayload,
  type CreateTermPayload,
  type UpdateMortgagePayload,
  type UpdateTermPayload,
} from "../api";
import { useMortgageData } from "./use-mortgage-data";
import { usePrimeRate } from "./use-prime-rate";
import { useAutoCreatePayment, useAutoRenewalPayment } from "./use-auto-payments";
import { advancePaymentDate, type PaymentFrequency } from "../utils/mortgage-math";
import { normalizePayments, normalizeTerm } from "../utils/normalize";
import type { UiTerm } from "../types";

export function useMortgageTrackingState() {
  const { toast } = useToast();

  const [selectedMortgageId, setSelectedMortgageId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTermRenewalOpen, setIsTermRenewalOpen] = useState(false);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("all");

  const [backfillStartDate, setBackfillStartDate] = useState("");
  const [backfillNumberOfPayments, setBackfillNumberOfPayments] = useState("12");
  const [backfillPaymentAmount, setBackfillPaymentAmount] = useState("");
  const [renewalTermType, setRenewalTermType] = useState("variable-fixed");
  const [renewalPaymentFrequency, setRenewalPaymentFrequency] = useState("monthly");
  const [renewalRate, setRenewalRate] = useState("");
  const [renewalSpread, setRenewalSpread] = useState("");
  const [renewalPrime, setRenewalPrime] = useState("");
  const [renewalTermYears, setRenewalTermYears] = useState("5");
  const [renewalStartDate, setRenewalStartDate] = useState("");
  const [renewalPaymentAmount, setRenewalPaymentAmount] = useState("");
  const [createPaymentEdited, setCreatePaymentEdited] = useState(false);
  const [renewalPaymentEdited, setRenewalPaymentEdited] = useState(false);

  const [isCreateMortgageOpen, setIsCreateMortgageOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [createPropertyPrice, setCreatePropertyPrice] = useState("");
  const [createDownPayment, setCreateDownPayment] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createAmortization, setCreateAmortization] = useState("25");
  const [createFrequency, setCreateFrequency] = useState("monthly");
  const [createTermType, setCreateTermType] = useState("variable-fixed");
  const [createTermYears, setCreateTermYears] = useState("5");
  const [createFixedRate, setCreateFixedRate] = useState("");
  const [createPrimeRate, setCreatePrimeRate] = useState("6.45");
  const [createSpread, setCreateSpread] = useState("-0.80");
  const [createPaymentAmount, setCreatePaymentAmount] = useState("");
  const [isCreatingMortgage, setIsCreatingMortgage] = useState(false);

  const [isEditMortgageOpen, setIsEditMortgageOpen] = useState(false);
  const [editPropertyPrice, setEditPropertyPrice] = useState("");
  const [editCurrentBalance, setEditCurrentBalance] = useState("");
  const [editPaymentFrequency, setEditPaymentFrequency] = useState("");

  const [isEditTermOpen, setIsEditTermOpen] = useState(false);
  const [editTermType, setEditTermType] = useState("");
  const [editTermStartDate, setEditTermStartDate] = useState("");
  const [editTermEndDate, setEditTermEndDate] = useState("");
  const [editTermYears, setEditTermYears] = useState("");
  const [editTermPaymentFrequency, setEditTermPaymentFrequency] = useState("");
  const [editTermPaymentAmount, setEditTermPaymentAmount] = useState("");
  const [editTermFixedRate, setEditTermFixedRate] = useState("");
  const [editTermPrimeRate, setEditTermPrimeRate] = useState("");
  const [editTermSpread, setEditTermSpread] = useState("");

  const propertyPrice = parseFloat(createPropertyPrice);
  const downPayment = parseFloat(createDownPayment);
  const propertyPriceError =
    !Number.isFinite(propertyPrice) || propertyPrice <= 0
      ? "Property price must be a valid number greater than zero"
      : "";

  const downPaymentError =
    !propertyPriceError && (!Number.isFinite(downPayment) || downPayment < 0)
      ? "Down payment must be a valid number (zero or more)"
      : !propertyPriceError && Number.isFinite(downPayment) && downPayment > propertyPrice
        ? "Down payment cannot exceed property price"
        : "";

  const loanAmount = propertyPrice - downPayment;
  const loanAmountError =
    !propertyPriceError && !downPaymentError && (!Number.isFinite(loanAmount) || loanAmount <= 0)
      ? "Loan amount must be greater than zero"
      : "";

  const isFormValid =
    createPropertyPrice &&
    createDownPayment &&
    createStartDate &&
    createAmortization &&
    Number.isFinite(propertyPrice) &&
    Number.isFinite(downPayment) &&
    Number.isFinite(loanAmount) &&
    !propertyPriceError &&
    !downPaymentError &&
    !loanAmountError;

  const { mortgages, mortgage, terms, payments, isLoading } = useMortgageData(selectedMortgageId);
  const { primeRate, setPrimeRate, primeRateData, isPrimeRateLoading, refetchPrimeRate } = usePrimeRate();

  useEffect(() => {
    if (mortgages.length === 0) {
      setSelectedMortgageId(null);
      return;
    }
    if (!selectedMortgageId || !mortgages.some((m) => m.id === selectedMortgageId)) {
      setSelectedMortgageId(mortgages[0].id);
    }
  }, [mortgages, selectedMortgageId]);

  useEffect(() => {
    if (!primeRateData?.primeRate) return;
    const latestPrime = primeRateData.primeRate.toString();
    if (isCreateMortgageOpen && createTermType !== "fixed") {
      setCreatePrimeRate(latestPrime);
    }
    if (isTermRenewalOpen && renewalTermType !== "fixed") {
      setRenewalPrime(latestPrime);
    }
    if (isEditTermOpen && editTermType !== "fixed" && !editTermPrimeRate) {
      setEditTermPrimeRate(latestPrime);
    }
  }, [
    primeRateData,
    isCreateMortgageOpen,
    isTermRenewalOpen,
    isEditTermOpen,
    createTermType,
    renewalTermType,
    editTermType,
    editTermPrimeRate,
  ]);

  const uiCurrentTerm = useMemo(() => normalizeTerm(terms ? terms[terms.length - 1] : undefined), [terms]);
  const paymentHistory = useMemo(() => normalizePayments(payments, terms), [payments, terms]);

  const lastKnownBalance =
    paymentHistory[paymentHistory.length - 1]?.remainingBalance ?? Number(mortgage?.currentBalance || 0);
  const lastKnownAmortizationMonths =
    paymentHistory[paymentHistory.length - 1]?.remainingAmortizationMonths ?? (mortgage ? mortgage.amortizationYears * 12 : 0);

  const autoCreatePayment = useAutoCreatePayment({
    loanAmount,
    amortizationYears: createAmortization,
    frequency: createFrequency as PaymentFrequency,
    termType: createTermType as UiTerm["termType"],
    fixedRateInput: createFixedRate,
    spreadInput: createSpread,
    primeInput: createPrimeRate,
    fallbackPrime: primeRate,
    startDate: createStartDate,
    paymentEdited: createPaymentEdited,
    setPaymentAmount: setCreatePaymentAmount,
  });

  const autoRenewalPayment = useAutoRenewalPayment({
    mortgage,
    currentTerm: uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    termType: renewalTermType as UiTerm["termType"],
    renewalRateInput: renewalRate,
    renewalPrimeInput: renewalPrime,
    renewalSpreadInput: renewalSpread,
    fallbackPrime: primeRate,
    fallbackSpread: uiCurrentTerm?.lockedSpread ?? null,
    fallbackFixedRate: uiCurrentTerm?.fixedRate ?? null,
    frequency: renewalPaymentFrequency as PaymentFrequency,
    paymentEdited: renewalPaymentEdited,
    setPaymentAmount: setRenewalPaymentAmount,
  });

  useEffect(() => {
    if (!isCreateMortgageOpen) {
      setCreatePaymentEdited(false);
    }
  }, [isCreateMortgageOpen]);

  useEffect(() => {
    if (!isTermRenewalOpen) {
      setRenewalPaymentEdited(false);
    }
  }, [isTermRenewalOpen]);

  const createPaymentMutation = useMutation({
    mutationFn: async (payment: {
      paymentDate: string;
      paymentPeriodLabel?: string | null;
      regularPaymentAmount: number;
      prepaymentAmount: number;
      paymentAmount: number;
      principalPaid: number;
      interestPaid: number;
      remainingBalance: number;
      primeRate?: number;
      effectiveRate: number;
      triggerRateHit: number;
      remainingAmortizationMonths: number;
    }) => {
      if (!mortgage?.id || !uiCurrentTerm?.id) throw new Error("No mortgage or term selected");
      return mortgageApi.createPayment(mortgage.id, {
        termId: uiCurrentTerm.id,
        paymentDate: payment.paymentDate,
        paymentPeriodLabel: payment.paymentPeriodLabel || undefined,
        regularPaymentAmount: payment.regularPaymentAmount.toString(),
        prepaymentAmount: payment.prepaymentAmount.toString(),
        paymentAmount: payment.paymentAmount.toString(),
        principalPaid: payment.principalPaid.toFixed(2),
        interestPaid: payment.interestPaid.toFixed(2),
        remainingBalance: payment.remainingBalance.toFixed(2),
        primeRate: payment.primeRate ? payment.primeRate.toString() : undefined,
        effectiveRate: payment.effectiveRate.toString(),
        triggerRateHit: payment.triggerRateHit,
        remainingAmortizationMonths: payment.remainingAmortizationMonths,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null) });
      toast({
        title: "Payment logged",
        description: "Mortgage payment has been recorded successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log payment",
        variant: "destructive",
      });
    },
  });

  const isStep2Valid = () => {
    const paymentValid = Boolean(createPaymentAmount) && parseFloat(createPaymentAmount) > 0;
    if (createTermType === "fixed") {
      const fixedRateValid = Boolean(createFixedRate) && parseFloat(createFixedRate) > 0;
      return paymentValid && fixedRateValid;
    }
    const spreadProvided = createSpread.trim() !== "";
    return paymentValid && spreadProvided;
  };

  const createMortgageWithTerm = async () => {
    if (!isStep2Valid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required term details",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingMortgage(true);
    let newMortgageId: string | null = null;

    try {
      const originalAmount = loanAmount;
      const termYears = Number(createTermYears) || 5;
      const termStartDate = createStartDate;
      const termEndDate = new Date(termStartDate);
      termEndDate.setFullYear(termEndDate.getFullYear() + termYears);

      const newMortgage = await mortgageApi.createMortgage({
        propertyPrice: propertyPrice.toString(),
        downPayment: downPayment.toString(),
        originalAmount: originalAmount.toString(),
        currentBalance: originalAmount.toString(),
        startDate: createStartDate,
        amortizationYears: parseInt(createAmortization),
        amortizationMonths: 0,
        paymentFrequency: createFrequency,
        annualPrepaymentLimitPercent: 20,
      });
      newMortgageId = newMortgage.id;

      await mortgageApi.createTerm(newMortgage.id, {
        termType: createTermType,
        startDate: termStartDate,
        endDate: termEndDate.toISOString().split("T")[0],
        termYears,
        fixedRate: createTermType === "fixed" ? createFixedRate : undefined,
        lockedSpread: createTermType !== "fixed" ? createSpread : "0",
        primeRate: createTermType !== "fixed" ? createPrimeRate : undefined,
        paymentFrequency: createFrequency,
        regularPaymentAmount: createPaymentAmount,
      });

      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      toast({
        title: "Mortgage created",
        description: "Your mortgage and initial term have been set up successfully",
      });

      setIsCreateMortgageOpen(false);
      setWizardStep(1);
      setCreatePropertyPrice("");
      setCreateDownPayment("");
      setCreateStartDate("");
      setCreateAmortization("25");
      setCreateFrequency("monthly");
      setCreateTermType("variable-fixed");
      setCreateTermYears("5");
      setCreateFixedRate("");
      setCreateSpread("-0.80");
      setCreatePaymentAmount("");
    } catch (error: any) {
      if (newMortgageId) {
        queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
        toast({
          title: "Term creation failed",
          description: "Mortgage was created but term setup failed. Please create a term manually.",
          variant: "destructive",
        });
        setIsCreateMortgageOpen(false);
        setWizardStep(1);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create mortgage",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreatingMortgage(false);
    }
  };

  const createTermMutation = useMutation({
    mutationFn: (term: CreateTermPayload) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.createTerm(mortgage.id, term);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgageTerms(mortgage?.id ?? null) });
      toast({
        title: "Term renewed",
        description: "New mortgage term has been created successfully",
      });
      setIsTermRenewalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to renew term",
        variant: "destructive",
      });
    },
  });

  const backfillPaymentsMutation = useMutation({
    mutationFn: (paymentsPayload: CreatePaymentPayload[]) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.createBulkPayments(mortgage.id, paymentsPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null) });
      toast({
        title: "Payments backfilled",
        description: `Successfully created ${data.created} payments`,
      });
      setIsBackfillOpen(false);
      setBackfillStartDate("");
      setBackfillNumberOfPayments("12");
      setBackfillPaymentAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to backfill payments",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => mortgageApi.deletePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null) });
      toast({
        title: "Payment deleted",
        description: "The payment has been removed from your records",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      });
    },
  });

  const formatAmortization = (years: number): string => {
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);
    if (months === 0) {
      return `${wholeYears} yr`;
    }
    if (wholeYears === 0) {
      return `${months} mo`;
    }
    return `${wholeYears} yr ${months} mo`;
  };

  const editMortgageMutation = useMutation({
    mutationFn: (updates: UpdateMortgagePayload) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.updateMortgage(mortgage.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      toast({
        title: "Mortgage updated",
        description: "Your mortgage details have been updated successfully",
      });
      setIsEditMortgageOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mortgage",
        variant: "destructive",
      });
    },
  });

  const updateTermMutation = useMutation({
    mutationFn: ({ termId, updates }: { termId: string; updates: UpdateTermPayload }) => {
      return mortgageApi.updateTerm(termId, updates);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: mortgageQueryKeys.mortgageTerms(mortgage?.id ?? null) });
      toast({
        title: "Term updated",
        description: "Your mortgage term has been updated successfully",
      });
      setIsEditTermOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update term",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isEditMortgageOpen && mortgage) {
      setEditPropertyPrice(mortgage.propertyPrice || "");
      setEditCurrentBalance(mortgage.currentBalance || "");
      setEditPaymentFrequency(mortgage.paymentFrequency || "");
    }
  }, [isEditMortgageOpen, mortgage]);

  useEffect(() => {
    if (isEditTermOpen && terms && terms.length > 0) {
      const currentTerm = terms[terms.length - 1];
      setEditTermType(currentTerm.termType || "");
      setEditTermStartDate(currentTerm.startDate || "");
      setEditTermEndDate(currentTerm.endDate || "");
      setEditTermPaymentFrequency(currentTerm.paymentFrequency || "");
      setEditTermPaymentAmount(currentTerm.regularPaymentAmount || "");

      if (currentTerm.termType === "fixed") {
        setEditTermFixedRate(currentTerm.fixedRate || "");
        setEditTermSpread("");
        setEditTermPrimeRate("");
      } else {
        setEditTermFixedRate("");
        setEditTermSpread(currentTerm.lockedSpread || "");
        const primeSnapshot = currentTerm.primeRate
          ? currentTerm.primeRate
          : primeRateData?.primeRate
            ? primeRateData.primeRate.toString()
            : "";
        setEditTermPrimeRate(primeSnapshot);
      }

      if (currentTerm.startDate && currentTerm.endDate) {
        const start = new Date(currentTerm.startDate);
        const end = new Date(currentTerm.endDate);
        const years = Math.round((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        setEditTermYears(years.toString());
      }
    }
  }, [isEditTermOpen, terms, primeRateData]);

  const handleTermRenewal = () => {
    const termYears = Number(renewalTermYears) || 5;
    const startDate = renewalStartDate || uiCurrentTerm?.endDate || new Date().toISOString().split("T")[0];
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + termYears);

    if (renewalTermType.startsWith("variable") && renewalPrime) {
      setPrimeRate(renewalPrime);
    }

    createTermMutation.mutate({
      termType: renewalTermType,
      startDate,
      endDate: endDate.toISOString().split("T")[0],
      termYears,
      fixedRate: renewalTermType === "fixed" ? renewalRate : undefined,
      lockedSpread: renewalTermType.startsWith("variable") ? renewalSpread : undefined,
      primeRate: renewalTermType.startsWith("variable") ? (renewalPrime || primeRate) : undefined,
      paymentFrequency: renewalPaymentFrequency,
      regularPaymentAmount: renewalPaymentAmount,
    });
  };

  const currentPrimeRateValue =
    primeRateData?.primeRate ??
    (uiCurrentTerm?.primeRate ?? null) ??
    paymentHistory[paymentHistory.length - 1]?.primeRate ??
    parseFloat(primeRate) ??
    0;

  const currentEffectiveRate = uiCurrentTerm
    ? uiCurrentTerm.termType === "fixed" && uiCurrentTerm.fixedRate
      ? uiCurrentTerm.fixedRate
      : currentPrimeRateValue + (uiCurrentTerm.lockedSpread || 0)
    : 0;

  const previewBackfillEndDate = useMemo(() => {
    if (!backfillStartDate || !uiCurrentTerm) return "";
    const total = parseInt(backfillNumberOfPayments, 10);
    if (!total || total <= 0) return "";
    let date = new Date(backfillStartDate);
    for (let i = 1; i < total; i++) {
      date = advancePaymentDate(date, uiCurrentTerm.paymentFrequency as PaymentFrequency);
    }
    return date.toISOString().split("T")[0];
  }, [backfillStartDate, backfillNumberOfPayments, uiCurrentTerm]);

  const summaryStats = {
    totalPayments: paymentHistory.length,
    totalPaid: paymentHistory.reduce((sum, p) => sum + p.paymentAmount, 0),
    totalPrincipal: paymentHistory.reduce((sum, p) => sum + p.principal, 0),
    totalInterest: paymentHistory.reduce((sum, p) => sum + p.interest, 0),
    currentBalance: mortgage ? Number(mortgage.currentBalance) : paymentHistory[paymentHistory.length - 1]?.remainingBalance || 0,
    currentRate: currentEffectiveRate,
    currentPrimeRate: currentPrimeRateValue,
    amortizationYears: mortgage ? mortgage.amortizationYears : paymentHistory[paymentHistory.length - 1]?.amortizationYears || 30,
    triggerHitCount: paymentHistory.filter((p) => p.triggerHit).length,
  };

  const filteredPayments =
    filterYear === "all" ? paymentHistory : paymentHistory.filter((p) => p.year.toString() === filterYear);

  const availableYears = Array.from(new Set(paymentHistory.map((p) => p.year))).sort((a, b) => b - a);

  const effectiveRate = uiCurrentTerm
    ? uiCurrentTerm.termType === "fixed" && uiCurrentTerm.fixedRate
      ? uiCurrentTerm.fixedRate.toFixed(2)
      : (parseFloat(primeRate) + uiCurrentTerm.lockedSpread).toFixed(2)
    : "0.00";

  const monthsRemainingInTerm = uiCurrentTerm
    ? Math.round((new Date(uiCurrentTerm.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  return {
    selectedMortgageId,
    setSelectedMortgageId,
    isDialogOpen,
    setIsDialogOpen,
    isTermRenewalOpen,
    setIsTermRenewalOpen,
    isBackfillOpen,
    setIsBackfillOpen,
    filterYear,
    setFilterYear,
    backfillStartDate,
    setBackfillStartDate,
    backfillNumberOfPayments,
    setBackfillNumberOfPayments,
    backfillPaymentAmount,
    setBackfillPaymentAmount,
    renewalTermType,
    setRenewalTermType,
    renewalPaymentFrequency,
    setRenewalPaymentFrequency,
    renewalRate,
    setRenewalRate,
    renewalSpread,
    setRenewalSpread,
    renewalPrime,
    setRenewalPrime,
    renewalTermYears,
    setRenewalTermYears,
    renewalStartDate,
    setRenewalStartDate,
    renewalPaymentAmount,
    setRenewalPaymentAmount,
    createPaymentEdited,
    setCreatePaymentEdited,
    renewalPaymentEdited,
    setRenewalPaymentEdited,
    isCreateMortgageOpen,
    setIsCreateMortgageOpen,
    wizardStep,
    setWizardStep,
    createPropertyPrice,
    setCreatePropertyPrice,
    createDownPayment,
    setCreateDownPayment,
    createStartDate,
    setCreateStartDate,
    createAmortization,
    setCreateAmortization,
    createFrequency,
    setCreateFrequency,
    createTermType,
    setCreateTermType,
    createTermYears,
    setCreateTermYears,
    createFixedRate,
    setCreateFixedRate,
    createPrimeRate,
    setCreatePrimeRate,
    createSpread,
    setCreateSpread,
    createPaymentAmount,
    setCreatePaymentAmount,
    isCreatingMortgage,
    setIsCreatingMortgage,
    isEditMortgageOpen,
    setIsEditMortgageOpen,
    editPropertyPrice,
    setEditPropertyPrice,
    editCurrentBalance,
    setEditCurrentBalance,
    editPaymentFrequency,
    setEditPaymentFrequency,
    isEditTermOpen,
    setIsEditTermOpen,
    editTermType,
    setEditTermType,
    editTermStartDate,
    setEditTermStartDate,
    editTermEndDate,
    setEditTermEndDate,
    editTermYears,
    setEditTermYears,
    editTermPaymentFrequency,
    setEditTermPaymentFrequency,
    editTermPaymentAmount,
    setEditTermPaymentAmount,
    editTermFixedRate,
    setEditTermFixedRate,
    editTermPrimeRate,
    setEditTermPrimeRate,
    editTermSpread,
    setEditTermSpread,
    propertyPrice,
    downPayment,
    propertyPriceError,
    downPaymentError,
    loanAmount,
    loanAmountError,
    isFormValid,
    mortgages,
    mortgage,
    terms,
    payments,
    isLoading,
    primeRate,
    setPrimeRate,
    primeRateData,
    isPrimeRateLoading,
    refetchPrimeRate,
    uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    autoCreatePayment,
    autoRenewalPayment,
    createPaymentMutation,
    createTermMutation,
    backfillPaymentsMutation,
    deletePaymentMutation,
    formatAmortization,
    editMortgageMutation,
    updateTermMutation,
    handleTermRenewal,
    createMortgageWithTerm,
    isStep2Valid,
    currentPrimeRateValue,
    currentEffectiveRate,
    previewBackfillEndDate,
    summaryStats,
    filteredPayments,
    availableYears,
    effectiveRate,
    monthsRemainingInTerm,
  };
}

