import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Loader2 } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UpdateMortgagePayload } from "../api";
import { FormProvider } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { EditMortgageFormData } from "../hooks/use-edit-mortgage-form";

interface EditMortgageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditMortgageFormData>;
  editMortgageMutation: UseMutationResult<any, Error, UpdateMortgagePayload, unknown>;
}

/**
 * Edit Mortgage Dialog Component
 * Uses React Hook Form for form management and validation
 */
export function EditMortgageDialog({
  open,
  onOpenChange,
  form,
  editMortgageMutation,
}: EditMortgageDialogProps) {
  const onSubmit = form.handleSubmit((data) => {
    editMortgageMutation.mutate({
      propertyPrice: data.propertyPrice,
      currentBalance: data.currentBalance,
      paymentFrequency: data.paymentFrequency,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <FormProvider {...form}>
          <DialogHeader>
            <DialogTitle>Edit Mortgage Details</DialogTitle>
            <DialogDescription>
              Update your property value, current balance, and payment settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="propertyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="edit-property-price">Property Value ($)</FormLabel>
                    <FormControl>
                      <Input
                        id="edit-property-price"
                        type="number"
                        placeholder="650000"
                        {...field}
                        data-testid="input-edit-property-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="edit-current-balance">Current Balance ($)</FormLabel>
                    <FormControl>
                      <Input
                        id="edit-current-balance"
                        type="number"
                        placeholder="550000"
                        {...field}
                        data-testid="input-edit-current-balance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="edit-payment-frequency">Payment Frequency</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      data-testid="select-edit-payment-frequency"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="biweekly">Biweekly</SelectItem>
                        <SelectItem value="accelerated-biweekly">Accelerated Biweekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="accelerated-weekly">Accelerated Weekly</SelectItem>
                        <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  editMortgageMutation.isPending ||
                  !form.formState.isValid ||
                  !form.formState.isDirty
                }
                data-testid="button-save-edit-mortgage"
              >
                {editMortgageMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
