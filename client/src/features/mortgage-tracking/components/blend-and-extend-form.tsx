import { FormProvider, useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { RefreshCw, Loader2, Calculator } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi } from "../api";
import { useBlendAndExtendForm, type BlendAndExtendFormData } from "../hooks/use-blend-and-extend-form";
import type { UiTerm } from "../types";
import type { Mortgage } from "@shared/schema";

interface BlendAndExtendFormProps {
  termId?: string;
  mortgageId?: string;
  currentTerm?: UiTerm | null;
  mortgage?: Mortgage | null;
  onCalculate: (data: BlendAndExtendFormData) => void;
  isCalculating?: boolean;
}

function BlendAndExtendFormFields({
  currentTerm,
  mortgage,
  onCalculate,
  isCalculating,
}: {
  currentTerm?: UiTerm | null;
  mortgage?: Mortgage | null;
  onCalculate: (data: BlendAndExtendFormData) => void;
  isCalculating?: boolean;
}) {
  const { control, watch, setValue, handleSubmit } = useFormContext<BlendAndExtendFormData>();

  const termType = currentTerm?.termType as "fixed" | "variable-changing" | "variable-fixed" | undefined;
  const termYears = currentTerm?.termYears;

  // Fetch market rate when term type and years are available
  const { data: marketRate, isLoading: isMarketRateLoading, refetch } = useQuery({
    queryKey: ["/api/market-rates", termType, termYears],
    queryFn: () => mortgageApi.fetchMarketRate(termType!, termYears!),
    enabled: !!termType && !!termYears,
    onSuccess: (data) => {
      if (data?.rate) {
        setValue("newMarketRate", data.rate.toFixed(2));
      }
    },
  });

  const handleFetchMarketRate = () => {
    if (termType && termYears) {
      refetch();
    }
  };

  // Calculate remaining amortization options
  // Default: extend to original amortization
  // Options: original, +5 years, +10 years (up to 30 years max)
  const originalAmortizationMonths = mortgage
    ? (mortgage.amortizationYears * 12 + (mortgage.amortizationMonths || 0))
    : 300;
  const remainingAmortizationMonths = originalAmortizationMonths; // For now, use original as remaining
  const amortizationOptions = [
    { value: remainingAmortizationMonths.toString(), label: `${Math.round(remainingAmortizationMonths / 12)} years (current)` },
    { value: originalAmortizationMonths.toString(), label: `${Math.round(originalAmortizationMonths / 12)} years (original)` },
  ];

  // Add extended options if not at max
  if (originalAmortizationMonths < 300) {
    const extended5 = Math.min(originalAmortizationMonths + 60, 360);
    if (extended5 > originalAmortizationMonths) {
      amortizationOptions.push({
        value: extended5.toString(),
        label: `${Math.round(extended5 / 12)} years (+5 years)`,
      });
    }
  }

  return (
    <div className="space-y-4 py-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Blend-and-Extend:</strong> Combine your current rate with the new market rate, 
            and optionally extend your amortization period to lower your payments.
          </p>
        </div>

        <FormField
          control={control}
          name="newMarketRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                New Market Rate (%)
                {termType && termYears && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6"
                    onClick={handleFetchMarketRate}
                    disabled={isMarketRateLoading}
                  >
                    <RefreshCw className={`h-3 w-3 ${isMarketRateLoading ? "animate-spin" : ""}`} />
                    Auto-fill
                  </Button>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="5.49"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Current market rate for a new term. Click "Auto-fill" to fetch from market rate service.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="extendedAmortizationMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extended Amortization (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amortization period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {amortizationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Extend your amortization to lower payments. Defaults to original amortization if not specified.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          onClick={handleSubmit(onCalculate)}
          disabled={isCalculating}
          className="w-full"
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Blend-and-Extend
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function BlendAndExtendForm({
  termId,
  mortgageId,
  currentTerm,
  mortgage,
  onCalculate,
  isCalculating = false,
}: BlendAndExtendFormProps) {
  const form = useBlendAndExtendForm();

  const handleCalculate = form.handleSubmit((data) => {
    onCalculate(data);
  });

  return (
    <FormProvider {...form}>
      <BlendAndExtendFormFields
        currentTerm={currentTerm}
        mortgage={mortgage}
        onCalculate={handleCalculate}
        isCalculating={isCalculating}
      />
    </FormProvider>
  );
}

