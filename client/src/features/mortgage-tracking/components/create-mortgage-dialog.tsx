import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { InfoTooltip } from "@/shared/ui/info-tooltip";
import { Loader2, RefreshCw } from "lucide-react";
import { FormProvider, useFormContext, type UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import type { CreateMortgageFormData } from "../hooks/use-create-mortgage-form";
import type { PrimeRateResponse } from "../api";
import { useEffect, useState } from "react";
import { mortgageApi } from "../api";

interface CreateMortgageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateMortgageFormData>;
  loanAmount: number;
  wizardStep: number;
  setWizardStep: (step: number) => void;
  onNextStep: () => void;
  onSubmit: () => void;
  isCreatingMortgage: boolean;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  autoPayment?: string;
  paymentEdited: boolean;
  onPaymentAmountChange: (value: string) => void;
  onUseAutoPayment: () => void;
  primeRateData?: PrimeRateResponse;
  onRefreshPrime: () => void;
  isPrimeRateLoading: boolean;
}

/**
 * Step 1: Mortgage Details Form Fields
 */
function Step1Fields() {
  const { control, watch } = useFormContext<CreateMortgageFormData>();

  const propertyPrice = watch("propertyPrice");
  const downPayment = watch("downPayment");
  const loanAmountValue =
    (Number(propertyPrice) || 0) - (Number(downPayment) || 0);

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="propertyPrice"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="property-price">Property Price ($)</FormLabel>
              <FormControl>
                <Input
                  id="property-price"
                  type="number"
                  placeholder="500000"
                  {...field}
                  data-testid="input-property-price"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="downPayment"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="down-payment">Down Payment ($)</FormLabel>
              <FormControl>
                <Input
                  id="down-payment"
                  type="number"
                  placeholder="100000"
                  {...field}
                  data-testid="input-down-payment"
                />
              </FormControl>
              <FormMessage />
              {Number(propertyPrice) > 0 &&
                Number(downPayment) >= 0 &&
                !fieldState.error && (
                  <p className="text-sm text-muted-foreground font-medium">
                    Loan amount: $
                    {Number.isFinite(loanAmountValue)
                      ? loanAmountValue.toLocaleString()
                      : "0"}
                  </p>
                )}
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="startDate"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="start-date">Mortgage Start Date</FormLabel>
            <FormControl>
              <Input
                id="start-date"
                type="date"
                {...field}
                data-testid="input-start-date"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="amortization"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="amortization-years">
                Amortization (years)
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                data-testid="select-amortization"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="15">15 Years</SelectItem>
                  <SelectItem value="20">20 Years</SelectItem>
                  <SelectItem value="25">25 Years</SelectItem>
                  <SelectItem value="30">30 Years</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="frequency"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="payment-frequency">
                Payment Frequency
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                data-testid="select-frequency"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="accelerated-biweekly">
                    Accelerated Bi-weekly
                  </SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

/**
 * Step 2: Term Details Form Fields
 */
function Step2Fields({
  loanAmount,
  autoPayment,
  paymentEdited,
  onPaymentAmountChange,
  onUseAutoPayment,
  primeRateData,
  onRefreshPrime,
  isPrimeRateLoading,
}: {
  loanAmount: number;
  autoPayment?: string;
  paymentEdited: boolean;
  onPaymentAmountChange: (value: string) => void;
  onUseAutoPayment: () => void;
  primeRateData?: PrimeRateResponse;
  onRefreshPrime: () => void;
  isPrimeRateLoading: boolean;
}) {
  const { control, watch, setValue } = useFormContext<CreateMortgageFormData>();

  const termType = watch("termType");
  const amortization = watch("amortization");
  const frequency = watch("frequency");
  const primeRate = watch("primeRate");
  const spread = watch("spread");
  const startDate = watch("startDate");
  
  // Fetch historical prime rate if startDate is in the past
  const [historicalPrimeRate, setHistoricalPrimeRate] = useState<{ rate: number; date: string } | null>(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  
  useEffect(() => {
    if (startDate && termType !== "fixed") {
      const startDateObj = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Only fetch historical rate if startDate is in the past
      if (startDateObj < today) {
        setIsLoadingHistorical(true);
        const queryStartDate = new Date(startDateObj);
        queryStartDate.setMonth(queryStartDate.getMonth() - 3);
        const queryEndDate = new Date(startDateObj);
        queryEndDate.setDate(queryEndDate.getDate() + 1);
        
        mortgageApi
          .fetchHistoricalPrimeRates(
            queryStartDate.toISOString().split("T")[0],
            queryEndDate.toISOString().split("T")[0]
          )
          .then((response) => {
            if (response.rates && response.rates.length > 0) {
              // Find the most recent rate on or before startDate
              const applicableRates = response.rates
                .filter((r) => r.date <= startDate)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
              if (applicableRates.length > 0) {
                const rate = applicableRates[0];
                setHistoricalPrimeRate({ rate: rate.primeRate, date: rate.date });
                // Update form field with historical rate
                setValue("primeRate", rate.primeRate.toFixed(2), { shouldValidate: false });
              } else {
                setHistoricalPrimeRate(null);
              }
            } else {
              setHistoricalPrimeRate(null);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch historical prime rate:", error);
            setHistoricalPrimeRate(null);
          })
          .finally(() => {
            setIsLoadingHistorical(false);
          });
      } else {
        // Start date is today or in future, use current rate
        setHistoricalPrimeRate(null);
        if (primeRateData?.primeRate) {
          setValue("primeRate", primeRateData.primeRate.toFixed(2), { shouldValidate: false });
        }
      }
    }
  }, [startDate, termType, setValue]);
  
  // Determine which rate to display
  const displayRate = historicalPrimeRate?.rate ?? primeRateData?.primeRate;
  const displayDate = historicalPrimeRate?.date ?? primeRateData?.effectiveDate;
  const isHistorical = historicalPrimeRate !== null;

  return (
    <div className="space-y-4 py-4">
      <div className="p-3 bg-muted rounded-lg text-sm">
        <p>
          <strong>Loan:</strong> ${loanAmount.toLocaleString()} over{" "}
          {amortization || "25"} years
        </p>
        <p>
          <strong>Payments:</strong> {(frequency || "monthly").replace("-", " ")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="termType"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center gap-2">
                <FormLabel>Mortgage Type</FormLabel>
                <InfoTooltip content="Fixed: Rate stays constant. Variable: Rate adjusts with Prime rate." />
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
                  <SelectItem value="variable-changing">
                    Variable (Changing Payment)
                  </SelectItem>
                  <SelectItem value="variable-fixed">
                    Variable (Fixed Payment)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="termYears"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Term Length</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                data-testid="select-term-years"
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
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {termType === "fixed" ? (
        <FormField
          control={control}
          name="fixedRate"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="fixed-rate">Fixed Interest Rate (%)</FormLabel>
              <FormControl>
                <Input
                  id="fixed-rate"
                  type="number"
                  step="0.01"
                  placeholder="4.99"
                  {...field}
                  data-testid="input-fixed-rate"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="primeRate"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="prime-rate">
                    {isHistorical ? "Prime Rate for Start Date (%)" : "Current Prime Rate (%)"}
                  </FormLabel>
                  {!isHistorical && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={onRefreshPrime}
                      disabled={isPrimeRateLoading || isLoadingHistorical}
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
                  {isLoadingHistorical && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
                <FormControl>
                  <Input
                    id="prime-rate"
                    type="number"
                    step="0.01"
                    placeholder="6.45"
                    {...field}
                    value={displayRate?.toFixed(2) ?? field.value}
                    readOnly
                    disabled={isLoadingHistorical}
                    data-testid="input-prime-rate"
                  />
                </FormControl>
                {displayDate && (
                  <p className="text-xs text-muted-foreground">
                    {isHistorical ? (
                      <>Historical Bank of Canada rate effective on{" "}
                      {new Date(displayDate).toLocaleDateString()}</>
                    ) : (
                      <>Bank of Canada rate as of{" "}
                      {new Date(displayDate).toLocaleDateString()}</>
                    )}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="spread"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="spread">Your Spread (+/- from Prime)</FormLabel>
                <FormControl>
                  <Input
                    id="spread"
                    type="number"
                    step="0.01"
                    placeholder="-0.80"
                    {...field}
                    data-testid="input-spread"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Effective rate:{" "}
                  {(
                    (Number(primeRate || "0") || 0) +
                    (Number(spread || "0") || 0)
                  ).toFixed(2)}
                  %
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={control}
        name="paymentAmount"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="payment-amount">
              Regular Payment Amount ($)
            </FormLabel>
            <FormControl>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                placeholder="2500.00"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onPaymentAmountChange(e.target.value);
                }}
                data-testid="input-payment-amount"
              />
            </FormControl>
            {autoPayment && (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Auto payment: ${autoPayment}</span>
                {paymentEdited && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onUseAutoPayment}
                  >
                    Use auto
                  </Button>
                )}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/**
 * Create Mortgage Dialog with React Hook Form
 */
export function CreateMortgageDialog({
  open,
  onOpenChange,
  form,
  loanAmount,
  wizardStep,
  setWizardStep,
  onNextStep,
  onSubmit,
  isCreatingMortgage,
  isStep1Valid,
  isStep2Valid,
  autoPayment,
  paymentEdited,
  onPaymentAmountChange,
  onUseAutoPayment,
  primeRateData,
  onRefreshPrime,
  isPrimeRateLoading,
}: CreateMortgageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormProvider {...form}>
          <DialogHeader>
            <DialogTitle>
              {wizardStep === 1
                ? "Step 1: Mortgage Details"
                : "Step 2: Term Details"}
            </DialogTitle>
            <DialogDescription>
              {wizardStep === 1
                ? "Enter your property and loan information"
                : "Set up your initial mortgage term with interest rate"}
            </DialogDescription>
            <div className="flex gap-2 pt-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  wizardStep >= 1 ? "bg-primary" : "bg-muted"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  wizardStep >= 2 ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          </DialogHeader>

          {wizardStep === 1 ? (
            <Step1Fields />
          ) : (
            <Step2Fields
              loanAmount={loanAmount}
              autoPayment={autoPayment}
              paymentEdited={paymentEdited}
              onPaymentAmountChange={onPaymentAmountChange}
              onUseAutoPayment={onUseAutoPayment}
              primeRateData={primeRateData}
              onRefreshPrime={onRefreshPrime}
              isPrimeRateLoading={isPrimeRateLoading}
            />
          )}

          <DialogFooter className="gap-2">
            {wizardStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={onNextStep}
                  disabled={!isStep1Valid}
                  data-testid="button-next-step"
                >
                  Next: Term Details
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setWizardStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={isCreatingMortgage || !isStep2Valid}
                  data-testid="button-create-mortgage-term"
                >
                  {isCreatingMortgage && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create Mortgage
                </Button>
              </>
            )}
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
