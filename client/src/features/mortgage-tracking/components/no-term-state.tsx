import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { TermRenewalDialog } from "./term-renewal-dialog";
import type { UseFormReturn } from "react-hook-form";
import type { PrimeRateResponse } from "../api";

interface NoTermStateProps {
  mortgage: {
    startDate?: string | null;
  };
  isTermRenewalOpen: boolean;
  onTermRenewalOpenChange: (open: boolean) => void;
  form: UseFormReturn<any>;
  isValid: boolean;
  autoPaymentAmount: string;
  paymentEdited: boolean;
  onPaymentAmountChange: (amount: string) => void;
  onUseAutoPayment: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  primeRateData?: PrimeRateResponse;
  onRefreshPrime: () => void;
  isPrimeRateLoading: boolean;
}

/**
 * Component displayed when a mortgage exists but has no term data.
 * Prompts user to create their first mortgage term.
 */
export function NoTermState({
  mortgage: _mortgage,
  isTermRenewalOpen,
  onTermRenewalOpenChange,
  form,
  isValid,
  autoPaymentAmount,
  paymentEdited,
  onPaymentAmountChange,
  onUseAutoPayment,
  onSubmit,
  isSubmitting,
  primeRateData,
  onRefreshPrime,
  isPrimeRateLoading,
}: NoTermStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">No Term Data</h2>
        <p className="text-muted-foreground max-w-md">
          Your mortgage has been created! Now create your first mortgage term to start tracking
          payments.
        </p>
      </div>

      <TermRenewalDialog
        open={isTermRenewalOpen}
        onOpenChange={onTermRenewalOpenChange}
        title="Create Mortgage Term"
        description="Set up your initial mortgage term with interest rate and payment details"
        showAlert={false}
        triggerButton={
          <Button size="lg" data-testid="button-create-first-term">
            <Plus className="h-5 w-5 mr-2" />
            Create First Term
          </Button>
        }
        form={form}
        isValid={isValid}
        autoPaymentAmount={autoPaymentAmount}
        paymentEdited={paymentEdited}
        onPaymentAmountChange={onPaymentAmountChange}
        onUseAutoPayment={onUseAutoPayment}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        primeRateData={primeRateData}
        onRefreshPrime={onRefreshPrime}
        isPrimeRateLoading={isPrimeRateLoading}
      />
    </div>
  );
}
