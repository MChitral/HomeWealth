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
import { useHelocBorrowing } from "../hooks";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { HelocAccount } from "@shared/schema";
import { calculateAvailableCredit } from "@server-shared/calculations/heloc/available-credit";

const borrowSchema = z.object({
  amount: z.union([z.string(), z.number()]).transform((val) => (typeof val === "number" ? val : parseFloat(val))).refine((val) => val > 0, "Amount must be greater than 0"),
  transactionDate: z.string().min(1, "Transaction date is required"),
  description: z.string().optional(),
});

type BorrowFormData = z.infer<typeof borrowSchema>;

interface BorrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: HelocAccount;
}

export function BorrowDialog({ open, onOpenChange, account }: BorrowDialogProps) {
  const { toast } = useToast();
  const borrow = useHelocBorrowing();

  const creditLimit = Number(account.creditLimit);
  const currentBalance = Number(account.currentBalance);
  const availableCredit = calculateAvailableCredit(creditLimit, currentBalance);

  const form = useForm<BorrowFormData>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      amount: 0,
      transactionDate: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  const onSubmit = async (data: BorrowFormData) => {
    if (data.amount > availableCredit) {
      toast({
        title: "Insufficient Credit",
        description: `Borrowing amount exceeds available credit of $${availableCredit.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await borrow.mutateAsync({
        accountId: account.id,
        payload: data,
      });
      toast({
        title: "Borrowing Recorded",
        description: "Your borrowing transaction has been recorded successfully.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record borrowing",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Borrow from HELOC</DialogTitle>
          <DialogDescription>
            Record a borrowing transaction. Available credit: ${availableCredit.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrowing Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
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
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Home renovation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={borrow.isPending}>
                {borrow.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Record Borrowing
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

