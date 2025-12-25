import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useCreateSmithManeuverStrategy, useUpdateSmithManeuverStrategy } from "../hooks";
import type { SmithManeuverStrategy, InsertSmithManeuverStrategy } from "@shared/schema";
import { useState, useEffect } from "react";
import { useMarginalTaxRate } from "@/features/tax";

const strategyFormSchema = z.object({
  strategyName: z.string().min(1, "Strategy name is required"),
  mortgageId: z.string().min(1, "Mortgage is required"),
  helocAccountId: z.string().min(1, "HELOC account is required"),
  prepaymentAmount: z.string().min(1, "Prepayment amount is required"),
  prepaymentFrequency: z.enum(["monthly", "quarterly", "annually", "lump_sum"]),
  borrowingPercentage: z.string().min(1, "Borrowing percentage is required"),
  expectedReturnRate: z.string().min(1, "Expected return rate is required"),
  annualIncome: z.string().min(1, "Annual income is required"),
  province: z.string().length(2, "Province code is required"),
  projectionYears: z.number().min(1).max(50),
  startDate: z.string().min(1, "Start date is required"),
});

type StrategyFormValues = z.infer<typeof strategyFormSchema>;

interface StrategyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: SmithManeuverStrategy | null;
  mortgages: Array<{ id: string; propertyPrice: string }>;
  helocAccounts: Array<{ id: string; accountName: string }>;
}

export function StrategyForm({
  open,
  onOpenChange,
  strategy,
  mortgages,
  helocAccounts,
}: StrategyFormProps) {
  const createStrategy = useCreateSmithManeuverStrategy();
  const updateStrategy = useUpdateSmithManeuverStrategy();
  const [marginalTaxRate, setMarginalTaxRate] = useState<number | null>(null);

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: strategy
      ? {
          strategyName: strategy.strategyName,
          mortgageId: strategy.mortgageId,
          helocAccountId: strategy.helocAccountId,
          prepaymentAmount: strategy.prepaymentAmount,
          prepaymentFrequency: strategy.prepaymentFrequency as "monthly" | "quarterly" | "annually" | "lump_sum",
          borrowingPercentage: strategy.borrowingPercentage,
          expectedReturnRate: strategy.expectedReturnRate,
          annualIncome: strategy.annualIncome,
          province: strategy.province,
          projectionYears: strategy.projectionYears,
          startDate: strategy.startDate,
        }
      : {
          strategyName: "",
          mortgageId: "",
          helocAccountId: "",
          prepaymentAmount: "",
          prepaymentFrequency: "monthly",
          borrowingPercentage: "100",
          expectedReturnRate: "6.00",
          annualIncome: "",
          province: "ON",
          projectionYears: 30,
          startDate: new Date().toISOString().split("T")[0],
        },
  });

  const annualIncome = form.watch("annualIncome");
  const province = form.watch("province");
  const { data: taxRateData } = useMarginalTaxRate(
    annualIncome ? parseFloat(annualIncome) : null,
    province || null
  );

  useEffect(() => {
    if (taxRateData) {
      setMarginalTaxRate(taxRateData.marginalTaxRate);
    }
  }, [taxRateData]);

  const onSubmit = async (values: StrategyFormValues) => {
    try {
      const payload: Omit<InsertSmithManeuverStrategy, "userId"> = {
        ...values,
        prepaymentAmount: values.prepaymentAmount,
        borrowingPercentage: values.borrowingPercentage,
        expectedReturnRate: values.expectedReturnRate,
        annualIncome: values.annualIncome,
        marginalTaxRate: marginalTaxRate?.toString(),
        investmentAllocation: null,
      };

      if (strategy) {
        await updateStrategy.mutateAsync({ id: strategy.id, payload });
      } else {
        await createStrategy.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to save strategy:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{strategy ? "Edit Strategy" : "Create Smith Maneuver Strategy"}</DialogTitle>
          <DialogDescription>
            Configure your Smith Maneuver strategy parameters
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="strategyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Smith Maneuver Strategy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mortgageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mortgage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mortgage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mortgages.map((mortgage) => (
                          <SelectItem key={mortgage.id} value={mortgage.id}>
                            {formatCurrency(Number(mortgage.propertyPrice))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="helocAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HELOC Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select HELOC" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {helocAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prepaymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prepayment Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prepaymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prepayment Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="lump_sum">Lump Sum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="borrowingPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Borrowing Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="100" {...field} />
                    </FormControl>
                    <FormDescription>% of prepayment to borrow from HELOC</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedReturnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Return Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="6.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annualIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Income</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="150000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ON">Ontario</SelectItem>
                        <SelectItem value="BC">British Columbia</SelectItem>
                        <SelectItem value="AB">Alberta</SelectItem>
                        <SelectItem value="QC">Quebec</SelectItem>
                        <SelectItem value="MB">Manitoba</SelectItem>
                        <SelectItem value="SK">Saskatchewan</SelectItem>
                        <SelectItem value="NS">Nova Scotia</SelectItem>
                        <SelectItem value="NB">New Brunswick</SelectItem>
                        <SelectItem value="NL">Newfoundland</SelectItem>
                        <SelectItem value="PE">Prince Edward Island</SelectItem>
                        <SelectItem value="NT">Northwest Territories</SelectItem>
                        <SelectItem value="NU">Nunavut</SelectItem>
                        <SelectItem value="YT">Yukon</SelectItem>
                      </SelectContent>
                    </Select>
                    {marginalTaxRate && (
                      <FormDescription>Marginal Tax Rate: {marginalTaxRate.toFixed(2)}%</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectionYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projection Years</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createStrategy.isPending || updateStrategy.isPending}>
                {strategy ? "Update" : "Create"} Strategy
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
  }).format(amount);
}

