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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Loader2 } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UpdateMortgagePayload } from "../api";

interface EditMortgageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyPrice: string;
  setPropertyPrice: (value: string) => void;
  currentBalance: string;
  setCurrentBalance: (value: string) => void;
  paymentFrequency: string;
  setPaymentFrequency: (value: string) => void;
  editMortgageMutation: UseMutationResult<any, Error, UpdateMortgagePayload, unknown>;
}

export function EditMortgageDialog({
  open,
  onOpenChange,
  propertyPrice,
  setPropertyPrice,
  currentBalance,
  setCurrentBalance,
  paymentFrequency,
  setPaymentFrequency,
  editMortgageMutation,
}: EditMortgageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Mortgage Details</DialogTitle>
          <DialogDescription>Update your property value, current balance, and payment settings</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-property-price">Property Value ($)</Label>
            <Input
              id="edit-property-price"
              type="number"
              placeholder="650000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              data-testid="input-edit-property-price"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-current-balance">Current Balance ($)</Label>
            <Input
              id="edit-current-balance"
              type="number"
              placeholder="550000"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              data-testid="input-edit-current-balance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-payment-frequency">Payment Frequency</Label>
            <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
              <SelectTrigger data-testid="select-edit-payment-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="accelerated-biweekly">Accelerated Biweekly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="accelerated-weekly">Accelerated Weekly</SelectItem>
                <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              editMortgageMutation.mutate({
                propertyPrice,
                currentBalance,
                paymentFrequency,
              });
            }}
            disabled={editMortgageMutation.isPending || !propertyPrice || !currentBalance}
            data-testid="button-save-edit-mortgage"
          >
            {editMortgageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

