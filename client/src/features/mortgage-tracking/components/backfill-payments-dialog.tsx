import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info, Loader2 } from "lucide-react";
import { FormProvider, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import type { PrimeRateResponse, CreatePaymentPayload } from "../api";
import { mortgageApi } from "../api";
import type { UiTerm } from "../types";
import type { Mortgage } from "@shared/schema";
import {
  calculatePaymentBreakdown,
  advancePaymentDate,
  type PaymentFrequency,
} from "../utils/mortgage-math";
import { useCallback, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { BackfillFormData } from "../hooks/use-backfill-form";

type BackfillMutation = {
  mutate: (payload: CreatePaymentPayload[]) => void;
  isPending: boolean;
};

type BackfillPaymentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTerm: UiTerm;
  mortgage: Mortgage | null;
  form: UseFormReturn<BackfillFormData>;
  primeRateData?: PrimeRateResponse;
  backfillMutation: BackfillMutation;
};

/**
 * Backfill Form Fields Component
 */
function BackfillFormFields({
  currentTerm,
  primeRateData,
}: {
  currentTerm: UiTerm;
  primeRateData?: PrimeRateResponse;
}) {
  const { control, watch } = useFormContext<BackfillFormData>();
  const numberOfPayments = watch("numberOfPayments");
  const paymentAmount = watch("paymentAmount");
  const startDate = watch("startDate");

  // Calculate preview end date
  const previewEndDate = useMemo(() => {
    if (!startDate || !currentTerm) return "";
    const total = parseInt(numberOfPayments || "0", 10);
    if (!total || total <= 0) return "";
    let date = new Date(startDate);
    for (let i = 1; i < total; i++) {
      date = advancePaymentDate(date, currentTerm.paymentFrequency as PaymentFrequency);
    }
    return date.toISOString().split("T")[0];
  }, [startDate, numberOfPayments, currentTerm]);

  return (
    <div className="space-y-4 py-4">
      {currentTerm.termType !== "fixed" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            For variable rate mortgages, historical Bank of Canada prime rates will be fetched
            automatically for each payment date to ensure accurate logging.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="backfill-start">First Payment Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="backfill-start"
                  type="date"
                  data-testid="input-backfill-start"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">Date of your first payment</p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="numberOfPayments"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="backfill-count">Number of Payments (1-60)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="backfill-count"
                  type="number"
                  min="1"
                  max="60"
                  onChange={(e) => {
                    const val = Math.min(60, Math.max(1, parseInt(e.target.value) || 1));
                    field.onChange(val.toString());
                  }}
                  data-testid="input-backfill-count"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">Enter any number of months</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="paymentAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="backfill-payment">Payment Amount ($)</FormLabel>
            <FormControl>
              <Input
                {...field}
                id="backfill-payment"
                type="number"
                step="0.01"
                placeholder={currentTerm.regularPaymentAmount?.toString() || "1500.00"}
                data-testid="input-backfill-payment"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">Your regular monthly payment amount</p>
            <FormMessage />
          </FormItem>
        )}
      />

      {startDate && parseInt(numberOfPayments || "0") > 0 && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">Summary</p>
          <p className="text-sm text-muted-foreground">
            Creating <span className="font-medium">{numberOfPayments} payments</span> from{" "}
            <span className="font-medium">{startDate}</span> to{" "}
            <span className="font-medium">{previewEndDate || startDate}</span>
          </p>
          {paymentAmount && (
            <p className="text-sm text-muted-foreground mt-1">
              Total:{" "}
              <span className="font-medium font-mono">
                {(
                  parseFloat(paymentAmount) * parseInt(numberOfPayments || "0")
                ).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
              </span>
            </p>
          )}
          {currentTerm.termType !== "fixed" && (
            <p className="text-xs text-muted-foreground mt-2">
              Prime rates will be fetched from Bank of Canada for accurate interest calculations
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Backfill Payments Dialog Component
 * Uses React Hook Form for form management and validation
 */
export function BackfillPaymentsDialog({
  open,
  onOpenChange,
  currentTerm,
  mortgage,
  form,
  primeRateData,
  backfillMutation,
}: BackfillPaymentsDialogProps) {
  const handleBackfill = useCallback(async () => {
    const formData = form.getValues();
    const numPayments = parseInt(formData.numberOfPayments);
    
    // Validate required data before proceeding
    if (!currentTerm || !formData.startDate || numPayments < 1) {
      return;
    }

    // Validate mortgage balance exists (required for accurate backfill)
    if (!mortgage?.currentBalance) {
      // This should not happen in normal flow, but validate to prevent data corruption
      console.error("Cannot backfill: Mortgage current balance is missing");
      return;
    }

    // Validate payment amount exists
    const paymentAmount =
      parseFloat(formData.paymentAmount) || currentTerm.regularPaymentAmount;
    
    if (!paymentAmount) {
      // Payment amount is required
      console.error("Cannot backfill: Payment amount is missing");
      return;
    }

    const endDate = new Date(formData.startDate);
    endDate.setMonth(endDate.getMonth() + numPayments - 1);
    const endDateStr = endDate.toISOString().split("T")[0];

    const queryStartDate = new Date(formData.startDate);
    queryStartDate.setMonth(queryStartDate.getMonth() - 3);
    const queryStartDateStr = queryStartDate.toISOString().split("T")[0];

    let historicalRates: { date: string; primeRate: number }[] = [];

    if (currentTerm.termType !== "fixed") {
      try {
        const ratesResponse = await mortgageApi.fetchHistoricalPrimeRates(
          queryStartDateStr,
          endDateStr,
        );
        historicalRates = ratesResponse.rates || [];
      } catch (error) {
        console.error("Failed to fetch historical rates:", error);
      }
    }

    const getRateForDate = (dateStr: string): number => {
      if (currentTerm.termType === "fixed") {
        return currentTerm.fixedRate || 4.5;
      }

      // Sort rates ascending (oldest first) to find the most recent rate effective on or before payment date
      // Bank of Canada API returns rates only on change dates, so we need the most recent rate <= payment date
      const sortedRates = [...historicalRates].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Find the most recent rate that was effective on or before the payment date
      // Iterate backwards from newest to find the first rate <= payment date
      let applicableRate: { date: string; primeRate: number } | undefined;
      for (let i = sortedRates.length - 1; i >= 0; i--) {
        const rate = sortedRates[i];
        if (rate.date <= dateStr) {
          applicableRate = rate;
          break;
        }
      }

      if (applicableRate) {
        const effectiveRate = applicableRate.primeRate + (currentTerm.lockedSpread || 0);
        return effectiveRate;
      }

      // If no historical rate found, check if we have rates but payment date is before all of them
      // In this case, use the oldest rate we have (closest to payment date)
      if (sortedRates.length > 0) {
        // Sort ascending to get oldest rate
        const oldestRate = [...sortedRates].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )[0];
        const effectiveRate = oldestRate.primeRate + (currentTerm.lockedSpread || 0);
        console.warn(
          `[Backfill] Payment date ${dateStr} is before all historical rates. Using oldest available rate: Prime ${oldestRate.primeRate}% (date: ${oldestRate.date}) + Spread ${currentTerm.lockedSpread || 0}% = Effective ${effectiveRate}%`
        );
        return effectiveRate;
      }

      // Last resort: use current prime rate (should rarely happen)
      const fallbackPrime = primeRateData?.primeRate || 5.45;
      const effectiveRate = fallbackPrime + (currentTerm.lockedSpread || 0);
      console.warn(
        `[Backfill] No historical rates available for ${dateStr}. Using current rate: Prime ${fallbackPrime}% + Spread ${currentTerm.lockedSpread || 0}% = Effective ${effectiveRate}%`
      );
      return effectiveRate;
    };

    const payments: CreatePaymentPayload[] = [];
    // Use actual mortgage balance (validated above)
    let runningBalance = Number(mortgage.currentBalance);
    let paymentDate = new Date(formData.startDate);
    const frequency = currentTerm.paymentFrequency as PaymentFrequency;

    for (let i = 0; i < numPayments; i++) {
      const paymentDateStr = paymentDate.toISOString().split("T")[0];
      const effectiveRateValue = getRateForDate(paymentDateStr);
      const primeRateForPayment =
        currentTerm.termType === "fixed"
          ? 0
          : effectiveRateValue - currentTerm.lockedSpread;

      const breakdown = calculatePaymentBreakdown({
        balance: runningBalance,
        paymentAmount,
        regularPaymentAmount: paymentAmount,
        extraPrepaymentAmount: 0,
        frequency,
        annualRate: effectiveRateValue / 100,
      });
      runningBalance = breakdown.remainingBalance;

      // Format payment period as "MMM-YYYY" (e.g., "Feb-2025")
      const paymentDateObj = new Date(paymentDateStr);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[paymentDateObj.getMonth()];
      const year = paymentDateObj.getFullYear();
      const paymentPeriodLabel = `${month}-${year}`;
      
      payments.push({
        termId: currentTerm.id,
        paymentDate: paymentDateStr,
        paymentPeriodLabel,
        regularPaymentAmount: paymentAmount.toString(),
        prepaymentAmount: "0",
        paymentAmount: paymentAmount.toString(),
        principalPaid: breakdown.principal.toString(),
        interestPaid: breakdown.interest.toString(),
        remainingBalance: runningBalance.toString(),
        primeRate: primeRateForPayment.toString(),
        effectiveRate: effectiveRateValue.toString(),
        triggerRateHit: breakdown.triggerRateHit ? 1 : 0,
        remainingAmortizationMonths:
          breakdown.remainingAmortizationMonths ??
          Math.max((mortgage?.amortizationYears || 25) * 12 - i, 0),
      });

      paymentDate = advancePaymentDate(paymentDate, frequency);
    }

    backfillMutation.mutate(payments);
  }, [form, currentTerm, mortgage, primeRateData, backfillMutation]);

  const handleSubmit = form.handleSubmit(() => {
    handleBackfill();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backfill Payments</DialogTitle>
          <DialogDescription>
            Quickly log multiple past payments at once (up to 60 payments)
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <BackfillFormFields
            currentTerm={currentTerm}
            primeRateData={primeRateData}
          />
        </FormProvider>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.formState.isValid || backfillMutation.isPending}
            data-testid="button-save-backfill"
          >
            {backfillMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create {form.getValues("numberOfPayments")} Payments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

