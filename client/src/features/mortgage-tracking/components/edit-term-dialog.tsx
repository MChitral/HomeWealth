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
import { Loader2, RefreshCw } from "lucide-react";
import { FormProvider, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { EditTermFormData } from "../hooks/use-edit-term-form";
import type { PrimeRateResponse } from "../api";

interface EditTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  form: UseFormReturn<EditTermFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  primeRateData?: PrimeRateResponse;
  isPrimeRateLoading: boolean;
  refetchPrimeRate: () => Promise<any>;
}

/**
 * Edit Term Form Fields Component
 */
function EditTermFormFields({
  primeRateData,
  isPrimeRateLoading,
  refetchPrimeRate,
}: {
  primeRateData?: PrimeRateResponse;
  isPrimeRateLoading: boolean;
  refetchPrimeRate: () => Promise<any>;
}) {
  const { control, watch, setValue } = useFormContext<EditTermFormData>();
  const termType = watch("termType");
  const startDate = watch("startDate");
  const termYears = watch("termYears");
  const primeRate = watch("primeRate");
  const spread = watch("spread");

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="edit-term-start">Start Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="edit-term-start"
                  type="date"
                  data-testid="input-edit-term-start"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="termYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="edit-term-years">Term Length (Years)</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // End date will be calculated on submit
                }}
              >
                <FormControl>
                  <SelectTrigger id="edit-term-years" data-testid="select-edit-term-years">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="4">4 years</SelectItem>
                  <SelectItem value="5">5 years</SelectItem>
                  <SelectItem value="7">7 years</SelectItem>
                  <SelectItem value="10">10 years</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="termType"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="edit-term-type">Mortgage Type</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger id="edit-term-type" data-testid="select-edit-term-type">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="fixed">Fixed Rate</SelectItem>
                <SelectItem value="variable-changing">Variable Rate (Changing Payment)</SelectItem>
                <SelectItem value="variable-fixed">Variable Rate (Fixed Payment)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {termType === "fixed" ? (
        <FormField
          control={control}
          name="fixedRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="edit-fixed-rate">Fixed Interest Rate (%)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="edit-fixed-rate"
                  type="number"
                  step="0.01"
                  placeholder="4.99"
                  data-testid="input-edit-fixed-rate"
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
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="edit-prime-rate">Current Prime Rate (%)</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={async () => {
                      const result = await refetchPrimeRate();
                      if (result.data?.primeRate) {
                        setValue("primeRate", result.data.primeRate.toString());
                      }
                    }}
                    disabled={isPrimeRateLoading}
                    data-testid="button-edit-refresh-prime"
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
                    {...field}
                    id="edit-prime-rate"
                    type="number"
                    step="0.01"
                    placeholder="4.45"
                    readOnly
                    data-testid="input-edit-prime-rate"
                  />
                </FormControl>
                {primeRateData && (
                  <p className="text-xs text-muted-foreground">
                    Bank of Canada rate as of {new Date(primeRateData.effectiveDate).toLocaleDateString()}
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
              <FormItem>
                <FormLabel htmlFor="edit-spread">Your Spread (+/- from Prime)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="edit-spread"
                    type="number"
                    step="0.01"
                    placeholder="-0.80"
                    data-testid="input-edit-spread"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Effective rate:{" "}
                  {(parseFloat(primeRate || "0") + parseFloat(spread || "0")).toFixed(2)}%
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={control}
        name="paymentFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="edit-payment-frequency">Payment Frequency</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger id="edit-payment-frequency" data-testid="select-edit-payment-frequency">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="monthly">Monthly (12 payments/year)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (26 payments/year)</SelectItem>
                <SelectItem value="accelerated-biweekly">Accelerated Bi-weekly</SelectItem>
                <SelectItem value="semi-monthly">Semi-monthly (24 payments/year)</SelectItem>
                <SelectItem value="weekly">Weekly (52 payments/year)</SelectItem>
                <SelectItem value="accelerated-weekly">Accelerated Weekly</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="paymentAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="edit-payment-amount">Regular Payment Amount ($)</FormLabel>
            <FormControl>
              <Input
                {...field}
                id="edit-payment-amount"
                type="number"
                step="0.01"
                placeholder="2500.00"
                data-testid="input-edit-payment-amount"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/**
 * Edit Term Dialog Component
 * Uses React Hook Form for form management and validation
 */
export function EditTermDialog({
  open,
  onOpenChange,
  triggerButton,
  form,
  onSubmit,
  isSubmitting,
  isValid,
  primeRateData,
  isPrimeRateLoading,
  refetchPrimeRate,
}: EditTermDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Current Term</DialogTitle>
          <DialogDescription>Update the details of your current mortgage term</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <EditTermFormFields
            primeRateData={primeRateData}
            isPrimeRateLoading={isPrimeRateLoading}
            refetchPrimeRate={refetchPrimeRate}
          />
        </FormProvider>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !isValid}
            data-testid="button-save-edit-term"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

