import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Separator } from "@/shared/ui/separator";
import { Info, Loader2, RefreshCw } from "lucide-react";
import { InfoTooltip } from "@/shared/ui/info-tooltip";
import type { UiTerm } from "../types";
import { FormProvider, useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { TermRenewalFormData } from "../hooks/use-term-renewal-form";
import type { PrimeRateResponse } from "../api";

interface TermRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TermRenewalFormData>;
  // Dialog configuration
  title?: string;
  description?: string;
  showAlert?: boolean;
  alertMessage?: string;
  defaultStartDate?: string;
  triggerButton?: React.ReactNode;
  // Auto payment feature (optional)
  autoPaymentAmount?: string;
  paymentEdited?: boolean;
  onPaymentAmountChange?: (value: string) => void;
  onUseAutoPayment?: () => void;
  // Submission
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  // Current term (for renewal context)
  currentTerm?: UiTerm | null;
  primeRateData?: PrimeRateResponse;
  onRefreshPrime?: () => void;
  isPrimeRateLoading?: boolean;
}

/**
 * Term Renewal Form Fields Component
 */
function TermRenewalFormFields({
  autoPaymentAmount,
  paymentEdited,
  onPaymentAmountChange,
  onUseAutoPayment,
  currentTerm,
  primeRateData,
  onRefreshPrime,
  isPrimeRateLoading,
}: {
  autoPaymentAmount?: string;
  paymentEdited?: boolean;
  onPaymentAmountChange?: (value: string) => void;
  onUseAutoPayment?: () => void;
  currentTerm?: UiTerm | null;
  primeRateData?: PrimeRateResponse;
  onRefreshPrime?: () => void;
  isPrimeRateLoading?: boolean;
}) {
  const { control, watch } = useFormContext<TermRenewalFormData>();

  const termType = watch("termType");
  const termYears = watch("termYears");
  const primeRate = watch("primeRate");
  const spread = watch("spread");

  return (
    <div className="space-y-4 py-4">
      <FormField
        control={control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="new-term-start">New Term Start Date</FormLabel>
            <FormControl>
              <Input
                id="new-term-start"
                type="date"
                {...field}
                value={field.value || currentTerm?.endDate || ""}
                data-testid="input-term-start-date"
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              Usually the day after your current term ends
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="termType"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel htmlFor="new-term-type">Mortgage Type</FormLabel>
              <InfoTooltip content="Fixed Rate: Interest rate stays the same for the entire term. Variable-Changing Payment: Your payment adjusts when Prime rate changes. Variable-Fixed Payment: Payment stays constant, but if Prime rises too much, you may hit the 'trigger rate' where payment doesn't cover interest." />
            </div>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              data-testid="select-term-type"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="fixed">Fixed Rate</SelectItem>
                <SelectItem value="variable-changing">Variable Rate (Changing Payment)</SelectItem>
                <SelectItem value="variable-fixed">Variable Rate (Fixed Payment)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {termType === "fixed" && "Rate stays constant for the term"}
              {termType === "variable-changing" && "Payment recalculates when Prime changes"}
              {termType === "variable-fixed" &&
                "Payment stays same, amortization extends if Prime rises"}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="paymentFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="payment-frequency">Payment Frequency</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              data-testid="select-payment-frequency"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="monthly">Monthly (12 payments/year)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (26 payments/year)</SelectItem>
                <SelectItem value="accelerated-biweekly">
                  Accelerated Bi-weekly (pays off faster)
                </SelectItem>
                <SelectItem value="semi-monthly">Semi-monthly (24 payments/year)</SelectItem>
                <SelectItem value="weekly">Weekly (52 payments/year)</SelectItem>
                <SelectItem value="accelerated-weekly">
                  Accelerated Weekly (pays off faster)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Accelerated payments pay your mortgage off faster by making the equivalent of one
              extra monthly payment per year
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="termYears"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="term-length">Term Length</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              data-testid="select-term-length"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">1 Year</SelectItem>
                <SelectItem value="2">2 Years</SelectItem>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="7">7 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Most Canadian mortgages are 3 or 5 year terms
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      {termType === "fixed" ? (
        <FormField
          control={control}
          name="fixedRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="new-fixed-rate">Fixed Rate (%)</FormLabel>
              <FormControl>
                <Input
                  id="new-fixed-rate"
                  type="number"
                  step="0.01"
                  placeholder="5.49"
                  {...field}
                  data-testid="input-fixed-rate"
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                This rate will be locked for the entire {termYears}-year term
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <>
          <FormField
            control={control}
            name="spread"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="new-spread">Negotiated Spread (Prime ± %)</FormLabel>
                <FormControl>
                  <Input
                    id="new-spread"
                    type="number"
                    step="0.01"
                    placeholder="-0.65"
                    {...field}
                    data-testid="input-spread"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Your lender offers Prime minus 0.65% (or Prime plus X%). This spread is locked for
                  your term.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="primeRate"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="current-prime">Current Prime Rate (%)</FormLabel>
                  {onRefreshPrime && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={onRefreshPrime}
                      disabled={isPrimeRateLoading}
                      data-testid="button-refresh-prime"
                    >
                      {isPrimeRateLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      <span className="ml-1">Refresh</span>
                    </Button>
                  )}
                </div>
                <FormControl>
                  <Input
                    id="current-prime"
                    type="number"
                    step="0.01"
                    placeholder="6.45"
                    {...field}
                    readOnly
                    data-testid="input-current-prime"
                  />
                </FormControl>
                {primeRateData?.effectiveDate && (
                  <p className="text-xs text-muted-foreground">
                    Bank of Canada rate as of{" "}
                    {new Date(primeRateData.effectiveDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Current Bank of Canada Prime rate. This will change during your term, but your
                  spread won't.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <Separator />

      <FormField
        control={control}
        name="paymentAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="new-payment-amount">Regular Payment Amount ($)</FormLabel>
            <FormControl>
              <Input
                id="new-payment-amount"
                type="number"
                step="0.01"
                placeholder="2100.00"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  if (onPaymentAmountChange) {
                    onPaymentAmountChange(e.target.value);
                  }
                }}
                data-testid="input-payment-amount"
              />
            </FormControl>
            {autoPaymentAmount && (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Auto payment: ${autoPaymentAmount}</span>
                {paymentEdited && onUseAutoPayment && (
                  <Button type="button" variant="ghost" size="sm" onClick={onUseAutoPayment}>
                    Use auto
                  </Button>
                )}
              </div>
            )}
            {!autoPaymentAmount && (
              <p className="text-sm text-muted-foreground">
                Your regular payment amount for this term. This can be calculated based on your
                balance and rate.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/**
 * Term Renewal Dialog Component
 * Uses React Hook Form for form management and validation
 */
export function TermRenewalDialog({
  open,
  onOpenChange,
  form,
  title = "Renew Mortgage Term",
  description = "Start a new term with a new rate or spread (typically every 3-5 years)",
  showAlert = true,
  alertMessage,
  defaultStartDate,
  triggerButton,
  autoPaymentAmount,
  paymentEdited,
  onPaymentAmountChange,
  onUseAutoPayment,
  onSubmit,
  isSubmitting,
  isValid,
  currentTerm,
  primeRateData,
  onRefreshPrime,
  isPrimeRateLoading,
}: TermRenewalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormProvider {...form}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {showAlert && (alertMessage || currentTerm) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {alertMessage ||
                  `Your current term ends on ${currentTerm?.endDate}. Use this dialog to negotiate a new term with your lender.`}
              </AlertDescription>
            </Alert>
          )}

          <TermRenewalFormFields
            autoPaymentAmount={autoPaymentAmount}
            paymentEdited={paymentEdited}
            onPaymentAmountChange={onPaymentAmountChange}
            onUseAutoPayment={onUseAutoPayment}
            currentTerm={currentTerm}
            primeRateData={primeRateData}
            onRefreshPrime={onRefreshPrime}
            isPrimeRateLoading={isPrimeRateLoading}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-renewal"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!isValid || isSubmitting}
              data-testid="button-save-renewal"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start New Term
            </Button>
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
