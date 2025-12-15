import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { mortgageApi, mortgageQueryKeys, type PrimeRateResponse } from "../api";
import { useCreateMortgageFormWithAutoPayment } from "./use-create-mortgage-form-with-auto-payment";

interface UseCreateMortgageFormStateProps {
  primeRateData?: PrimeRateResponse;
  defaultPrimeRate?: string;
  onSuccess?: (mortgageId: string) => void;
  onPrimeRateUpdate?: (primeRate: string) => void;
}

/**
 * Complete hook for mortgage creation form state management
 * Integrates React Hook Form, auto-payment calculations, and mutation logic
 */
export function useCreateMortgageFormState({
  primeRateData,
  defaultPrimeRate = "6.45",
  onSuccess,
  onPrimeRateUpdate,
}: UseCreateMortgageFormStateProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    form,
    loanAmount,
    wizardStep,
    setWizardStep,
    isStep1Valid,
    isStep2Valid,
    autoPayment,
    paymentEdited,
    handlePaymentAmountChange,
    useAutoPayment,
    reset,
  } = useCreateMortgageFormWithAutoPayment({
    primeRateData,
    defaultPrimeRate,
    onPrimeRateUpdate,
  });

  const createMortgageMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();

      // Validate step 2 before submission
      if (!isStep2Valid) {
        throw new Error("Please fill in all required term details");
      }

      const propertyPrice = Number(formData.propertyPrice);
      const downPayment = Number(formData.downPayment);
      const originalAmount = loanAmount;
      const termYears = Number(formData.termYears) || 5;
      const termStartDate = formData.startDate;
      const termEndDate = new Date(termStartDate);
      termEndDate.setFullYear(termEndDate.getFullYear() + termYears);

      // Create mortgage
      const newMortgage = await mortgageApi.createMortgage({
        propertyPrice: propertyPrice.toString(),
        downPayment: downPayment.toString(),
        originalAmount: originalAmount.toString(),
        currentBalance: originalAmount.toString(),
        startDate: formData.startDate,
        amortizationYears: parseInt(formData.amortization),
        amortizationMonths: 0,
        paymentFrequency: formData.frequency,
        annualPrepaymentLimitPercent: 20,
      });

      // Create initial term
      await mortgageApi.createTerm(newMortgage.id, {
        termType: formData.termType,
        startDate: termStartDate,
        endDate: termEndDate.toISOString().split("T")[0],
        termYears,
        fixedRate: formData.termType === "fixed" ? formData.fixedRate : undefined,
        lockedSpread: formData.termType !== "fixed" ? formData.spread : "0",
        primeRate: formData.termType !== "fixed" ? formData.primeRate : undefined,
        paymentFrequency: formData.frequency,
        regularPaymentAmount: formData.paymentAmount,
      });

      return newMortgage.id;
    },
    onSuccess: (mortgageId) => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      toast({
        title: "Mortgage created",
        description: "Your mortgage and initial term have been set up successfully",
      });
      reset();
      if (onSuccess) {
        onSuccess(mortgageId);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mortgage",
        variant: "destructive",
      });
    },
  });

  const handleNextStep = () => {
    if (!isStep1Valid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setWizardStep(2);
  };

  const handleSubmit = () => {
    form.handleSubmit(() => {
      createMortgageMutation.mutate();
    })();
  };

  return {
    form,
    loanAmount,
    wizardStep,
    setWizardStep,
    isStep1Valid,
    isStep2Valid,
    autoPayment,
    paymentEdited,
    handlePaymentAmountChange,
    useAutoPayment,
    handleNextStep,
    handleSubmit,
    createMortgageMutation,
    reset,
  };
}
