import { useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useUpdateHelocAccount } from "../hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks/use-mortgage-data";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { HelocAccount } from "@shared/schema";

const helocAccountUpdateSchema = z.object({
  accountName: z.string().min(1, "Account name is required").optional(),
  lenderName: z.string().min(1, "Lender name is required").optional(),
  mortgageId: z.string().optional(),
  maxLtvPercent: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined ? undefined : typeof val === "number" ? val : parseFloat(val)
    ),
  interestSpread: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined ? undefined : typeof val === "number" ? val : parseFloat(val)
    ),
  homeValueReference: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : typeof val === "number" ? val : parseFloat(val)
    ),
});

type HelocAccountUpdateFormData = z.infer<typeof helocAccountUpdateSchema>;

interface EditHelocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: HelocAccount;
}

export function EditHelocDialog({ open, onOpenChange, account }: EditHelocDialogProps) {
  const { toast } = useToast();
  const updateAccount = useUpdateHelocAccount();
  const { mortgages } = useMortgageData();

  const form = useForm<HelocAccountUpdateFormData>({
    resolver: zodResolver(helocAccountUpdateSchema),
    defaultValues: {
      accountName: account.accountName,
      lenderName: account.lenderName,
      mortgageId: account.mortgageId || "none",
      maxLtvPercent: Number(account.maxLtvPercent),
      interestSpread: Number(account.interestSpread),
      homeValueReference: account.homeValueReference
        ? Number(account.homeValueReference)
        : undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        accountName: account.accountName,
        lenderName: account.lenderName,
        mortgageId: account.mortgageId || "none",
        maxLtvPercent: Number(account.maxLtvPercent),
        interestSpread: Number(account.interestSpread),
        homeValueReference: account.homeValueReference
          ? Number(account.homeValueReference)
          : undefined,
      });
    }
  }, [open, account, form]);

  const onSubmit = async (data: HelocAccountUpdateFormData) => {
    try {
      await updateAccount.mutateAsync({
        id: account.id,
        payload: {
          accountName: data.accountName,
          lenderName: data.lenderName,
          mortgageId: data.mortgageId && data.mortgageId !== "none" ? data.mortgageId : null, // Explicitly set to null if unlinking
          maxLtvPercent: data.maxLtvPercent?.toFixed(2),
          interestSpread: data.interestSpread?.toFixed(3),
          homeValueReference: data.homeValueReference
            ? data.homeValueReference.toFixed(2)
            : undefined,
        },
      });
      toast({
        title: "HELOC Account Updated",
        description: "Your HELOC account has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update HELOC account",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit HELOC Account</DialogTitle>
          <DialogDescription>Update your HELOC account details</DialogDescription>
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
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mortgageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Mortgage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mortgage to link" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None (Unlinked)</SelectItem>
                      {mortgages.map((mortgage) => (
                        <SelectItem key={mortgage.id} value={mortgage.id}>
                          {mortgage.lenderName || "Mortgage"} - $
                          {Number(mortgage.currentBalance).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateAccount.isPending}>
                {updateAccount.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
