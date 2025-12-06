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
          render={({ field }) => (
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
                !field.fieldState.error && (
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
  const { control, watch } = useFormContext<CreateMortgageFormData>();

  const termType = watch("termType");
  const amortization = watch("amortization");
  const frequency = watch("frequency");
  const primeRate = watch("primeRate");
  const spread = watch("spread");

  return (
    <div className="space-y-4 py-4">
      <div className="p-3 bg-muted rounded-lg text-sm">
        <p>
          <strong>Loan:</strong> ${loanAmount.toLocaleString()} over{" "}
          {amortization} years
        </p>
        <p>
          <strong>Payments:</strong> {frequency.replace("-", " ")}
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
                    Current Prime Rate (%)
                  </FormLabel>
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
                </div>
                <FormControl>
                  <Input
                    id="prime-rate"
                    type="number"
                    step="0.01"
                    placeholder="6.45"
                    {...field}
                    readOnly
                    data-testid="input-prime-rate"
                  />
                </FormControl>
                {primeRateData && (
                  <p className="text-xs text-muted-foreground">
                    Bank of Canada rate as of{" "}
                    {new Date(primeRateData.effectiveDate).toLocaleDateString()}
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
