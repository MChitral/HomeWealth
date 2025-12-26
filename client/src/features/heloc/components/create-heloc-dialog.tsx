import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { useCreateHelocAccount } from "../hooks";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";

const helocAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  lenderName: z.string().min(1, "Lender name is required"),
  mortgageId: z.string().optional(),
  maxLtvPercent: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  interestSpread: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  currentBalance: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  homeValueReference: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" ? undefined : typeof val === "number" ? val : val ? parseFloat(val) : undefined
    ),
  accountOpeningDate: z.string().min(1, "Account opening date is required"),
  isReAdvanceable: z.boolean().optional(),
});

type HelocAccountFormData = z.infer<typeof helocAccountSchema>;

interface CreateHelocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHelocDialog({ open, onOpenChange }: CreateHelocDialogProps) {
  const { toast } = useToast();
  const createAccount = useCreateHelocAccount();

  const form = useForm<HelocAccountFormData>({
    resolver: zodResolver(helocAccountSchema),
    defaultValues: {
      accountName: "",
      lenderName: "",
      maxLtvPercent: 65,
      interestSpread: 0.5,
      currentBalance: 0,
      accountOpeningDate: new Date().toISOString().split("T")[0],
      isReAdvanceable: false,
    },
  });

  const onSubmit = async (data: HelocAccountFormData) => {
    try {
      await createAccount.mutateAsync({
        accountName: data.accountName,
        lenderName: data.lenderName,
        mortgageId: data.mortgageId || undefined,
        maxLtvPercent: data.maxLtvPercent.toFixed(2),
        interestSpread: data.interestSpread.toFixed(3),
        currentBalance: data.currentBalance.toFixed(2),
        homeValueReference: data.homeValueReference
          ? data.homeValueReference.toFixed(2)
          : undefined,
        accountOpeningDate: data.accountOpeningDate,
        accountStatus: "active",
        isReAdvanceable: data.isReAdvanceable ? 1 : 0,
        creditLimit: "0", // Will be calculated by service
      });
      toast({
        title: "HELOC Account Created",
        description: "Your HELOC account has been created successfully.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create HELOC account",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create HELOC Account</DialogTitle>
          <DialogDescription>
            Add a new Home Equity Line of Credit account to track your credit limit and
            transactions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Primary HELOC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lenderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lender Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., TD Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxLtvPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum LTV (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="65.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestSpread"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Spread (Prime + %)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.500"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Balance ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homeValueReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Value ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="500000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountOpeningDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Opening Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAccount.isPending}>
                {createAccount.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
