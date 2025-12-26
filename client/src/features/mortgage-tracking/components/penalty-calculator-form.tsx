import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useFormContext } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { mortgageApi } from "../api";
import type { PenaltyCalculatorFormData } from "../hooks/use-penalty-calculator-form";

export function PenaltyCalculatorForm() {
  const { control, watch, setValue } = useFormContext<PenaltyCalculatorFormData>();

  const termType = watch("termType");
  const termYears = watch("termYears");

  // Fetch market rate when term type and years are available
  const {
    data: marketRate,
    isLoading: isMarketRateLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/market-rates", termType, termYears],
    queryFn: () => mortgageApi.fetchMarketRate(termType!, termYears!),
    enabled: !!termType && !!termYears,
  });

  // Update form value when market rate is fetched
  useEffect(() => {
    if (marketRate?.rate) {
      setValue("marketRate", marketRate.rate.toFixed(2));
    }
  }, [marketRate, setValue]);

  const handleFetchMarketRate = () => {
    if (termType && termYears) {
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="balance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Mortgage Balance</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="500000"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>Enter your current mortgage balance</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="currentRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Interest Rate (%)</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="5.00"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>Your current mortgage interest rate as a percentage</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="termType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Term Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Rate</SelectItem>
                  <SelectItem value="variable-changing">Variable (Changing Payment)</SelectItem>
                  <SelectItem value="variable-fixed">Variable (Fixed Payment)</SelectItem>
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
            <FormItem>
              <FormLabel>Term Length (Years)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 Year</SelectItem>
                  <SelectItem value="2">2 Years</SelectItem>
                  <SelectItem value="3">3 Years</SelectItem>
                  <SelectItem value="4">4 Years</SelectItem>
                  <SelectItem value="5">5 Years</SelectItem>
                  <SelectItem value="7">7 Years</SelectItem>
                  <SelectItem value="10">10 Years</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="remainingMonths"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remaining Months in Term</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="24"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>Number of months remaining in your current term</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="marketRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Market Rate (%)
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
                placeholder="4.50"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>
              Current market rate for the remaining term. Click &quot;Auto-fill&quot; to fetch from
              market rate service.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="lenderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lender Name (Optional)</FormLabel>
            <FormControl>
              <Input type="text" placeholder="RBC, TD, BMO, etc." {...field} />
            </FormControl>
            <FormDescription>
              Optional: Enter your lender name for lender-specific penalty calculations
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="penaltyCalculationMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Penalty Calculation Method (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Use standard calculation" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ird_posted_rate">IRD (Posted Rate)</SelectItem>
                <SelectItem value="ird_discounted_rate">IRD (Discounted Rate)</SelectItem>
                <SelectItem value="ird_origination_comparison">
                  IRD (Origination Comparison)
                </SelectItem>
                <SelectItem value="three_month_interest">3-Month Interest Only</SelectItem>
                <SelectItem value="variable_rate">Variable Rate (3-Month Interest)</SelectItem>
                <SelectItem value="open_mortgage">Open Mortgage (No Penalty)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select a specific calculation method. Leave blank to use standard &quot;greater
              of&quot; calculation.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
