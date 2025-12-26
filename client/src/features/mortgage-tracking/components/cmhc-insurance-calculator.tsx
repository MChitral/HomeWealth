import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info, Calculator, TrendingUp, AlertCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { useInsuranceCalculator } from "../hooks/use-insurance-calculator";
import type { InsuranceCalculationResult } from "../api/insurance-api";
import { Separator } from "@/shared/ui/separator";

interface CMHCInsuranceCalculatorProps {
  defaultPropertyPrice?: string;
  defaultDownPayment?: string;
  onResultChange?: (result: InsuranceCalculationResult | null) => void;
  showProviderComparison?: boolean;
  compact?: boolean;
}

export function CMHCInsuranceCalculator({
  defaultPropertyPrice,
  defaultDownPayment,
  onResultChange,
  showProviderComparison = false,
  compact = false,
}: CMHCInsuranceCalculatorProps) {
  const {
    form,
    calculateMutation,
    compareMutation,
    handleCalculate,
    handleCompare,
    downPaymentPercent,
    isHighRatio,
  } = useInsuranceCalculator({
    defaultPropertyPrice,
    defaultDownPayment,
    onCalculate: (result) => {
      if (onResultChange) {
        onResultChange(result);
      }
    },
  });

  const [calculationResult, setCalculationResult] = useState<InsuranceCalculationResult | null>(
    null
  );
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Auto-calculate when form values change (debounced)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && form.formState.isValid && value.propertyPrice && value.downPayment) {
        const timer = setTimeout(() => {
          handleCalculate();
        }, 500); // Debounce 500ms
        return () => clearTimeout(timer);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleCalculate]);

  // Update result when calculation completes
  useEffect(() => {
    if (calculateMutation.data) {
      setCalculationResult(calculateMutation.data);
      if (onResultChange) {
        // Pass result with premiumPaymentType from form
        const resultWithPaymentType = {
          ...calculateMutation.data,
          premiumPaymentType: form.getValues("premiumPaymentType") || "upfront",
        };
        onResultChange(
          resultWithPaymentType as InsuranceCalculationResult & { premiumPaymentType: string }
        );
      }
    }
  }, [calculateMutation.data, onResultChange, form]);

  const propertyPrice = form.watch("propertyPrice");
  const downPayment = form.watch("downPayment");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-indigo-500" />
          Mortgage Default Insurance Calculator
        </CardTitle>
        <CardDescription>
          Calculate insurance premium for high-ratio mortgages (less than 20% down payment)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="500000"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Down Payment
                      {downPaymentPercent && propertyPrice && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({downPaymentPercent}%)
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* High-ratio warning or conventional message */}
            {propertyPrice && downPayment && Number(propertyPrice) > 0 && (
              <Alert variant={isHighRatio ? "default" : "default"}>
                {isHighRatio ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is a <strong>high-ratio mortgage</strong> (down payment &lt; 20%).
                      Mortgage default insurance is required.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This is a <strong>conventional mortgage</strong> (down payment ≥ 20%). No
                      mortgage default insurance is required.
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}

            {isHighRatio && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CMHC">CMHC</SelectItem>
                            <SelectItem value="Sagen">Sagen</SelectItem>
                            <SelectItem value="Genworth">Genworth</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mliSelectDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MLI Select Discount</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString() || "0"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">No Discount (0%)</SelectItem>
                            <SelectItem value="10">10% Discount</SelectItem>
                            <SelectItem value="20">20% Discount</SelectItem>
                            <SelectItem value="30">30% Discount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="premiumPaymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Payment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "upfront"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upfront">Pay Upfront</SelectItem>
                          <SelectItem value="added-to-principal">Add to Principal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || calculateMutation.isPending}
                  >
                    {calculateMutation.isPending ? "Calculating..." : "Calculate Premium"}
                  </Button>
                  {showProviderComparison && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCompare}
                      disabled={!form.formState.isValid || compareMutation.isPending}
                    >
                      {compareMutation.isPending ? "Comparing..." : "Compare Providers"}
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Calculation Results */}
            {calculationResult && isHighRatio && (
              <div className="mt-6 space-y-4">
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Calculation Results</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Mortgage Amount</Label>
                      <p className="text-lg font-semibold">
                        $
                        {calculationResult.mortgageAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">LTV Ratio</Label>
                      <p className="text-lg font-semibold">{calculationResult.ltvRatio}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Premium Rate</Label>
                      <p className="text-lg font-semibold">{calculationResult.premiumRate}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Premium Amount</Label>
                      <p className="text-lg font-semibold text-orange-600">
                        $
                        {calculationResult.premiumAfterDiscount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  {calculationResult.breakdown.discountAmount > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                          MLI Select Discount Applied
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Base Premium: $
                        {calculationResult.breakdown.basePremium.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <br />
                        Discount: $
                        {calculationResult.breakdown.discountAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <br />
                        Final Premium: $
                        {calculationResult.breakdown.finalPremium.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}

                  {form.watch("premiumPaymentType") === "added-to-principal" &&
                    calculationResult && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <Label className="text-muted-foreground">
                          Total Mortgage Amount (with premium)
                        </Label>
                        <p className="text-lg font-semibold text-blue-600">
                          $
                          {calculationResult.totalMortgageAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Provider Comparison */}
            {comparisonResult && showProviderComparison && (
              <div className="mt-6 space-y-4">
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Provider Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["CMHC", "Sagen", "Genworth"] as const).map((provider) => {
                      const result = comparisonResult[provider];
                      if (!result) return null;
                      return (
                        <Card key={provider}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{provider}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Premium Rate</Label>
                              <p className="text-sm font-semibold">{result.premiumRate}%</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Premium Amount
                              </Label>
                              <p className="text-sm font-semibold">
                                $
                                {result.premiumAfterDiscount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
