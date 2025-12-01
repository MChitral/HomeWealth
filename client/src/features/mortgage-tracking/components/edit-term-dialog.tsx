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
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { MortgageTerm } from "@shared/schema";
import type { PrimeRateResponse, UpdateTermPayload } from "../api";

interface EditTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  // Form state
  editTermType: string;
  setEditTermType: (value: string) => void;
  editTermStartDate: string;
  setEditTermStartDate: (value: string) => void;
  editTermEndDate: string;
  setEditTermEndDate: (value: string) => void;
  editTermYears: string;
  setEditTermYears: (value: string) => void;
  editTermPaymentFrequency: string;
  setEditTermPaymentFrequency: (value: string) => void;
  editTermPaymentAmount: string;
  setEditTermPaymentAmount: (value: string) => void;
  editTermFixedRate: string;
  setEditTermFixedRate: (value: string) => void;
  editTermPrimeRate: string;
  setEditTermPrimeRate: (value: string) => void;
  editTermSpread: string;
  setEditTermSpread: (value: string) => void;
  // Mutations and helpers
  terms?: MortgageTerm[];
  updateTermMutation: UseMutationResult<any, Error, { termId: string; updates: UpdateTermPayload }, unknown>;
  primeRateData?: PrimeRateResponse;
  isPrimeRateLoading: boolean;
  refetchPrimeRate: () => Promise<any>;
}

export function EditTermDialog({
  open,
  onOpenChange,
  triggerButton,
  editTermType,
  setEditTermType,
  editTermStartDate,
  setEditTermStartDate,
  editTermEndDate,
  setEditTermEndDate,
  editTermYears,
  setEditTermYears,
  editTermPaymentFrequency,
  setEditTermPaymentFrequency,
  editTermPaymentAmount,
  setEditTermPaymentAmount,
  editTermFixedRate,
  setEditTermFixedRate,
  editTermPrimeRate,
  setEditTermPrimeRate,
  editTermSpread,
  setEditTermSpread,
  terms,
  updateTermMutation,
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
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-term-start">Start Date</Label>
              <Input
                id="edit-term-start"
                type="date"
                value={editTermStartDate}
                onChange={(e) => {
                  setEditTermStartDate(e.target.value);
                  if (editTermYears) {
                    const start = new Date(e.target.value);
                    start.setFullYear(start.getFullYear() + parseInt(editTermYears));
                    setEditTermEndDate(start.toISOString().split("T")[0]);
                  }
                }}
                data-testid="input-edit-term-start"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-term-years">Term Length (Years)</Label>
              <Select
                value={editTermYears}
                onValueChange={(value) => {
                  setEditTermYears(value);
                  if (editTermStartDate) {
                    const start = new Date(editTermStartDate);
                    start.setFullYear(start.getFullYear() + parseInt(value));
                    setEditTermEndDate(start.toISOString().split("T")[0]);
                  }
                }}
              >
                <SelectTrigger id="edit-term-years" data-testid="select-edit-term-years">
                  <SelectValue />
                </SelectTrigger>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-term-type">Mortgage Type</Label>
            <Select value={editTermType} onValueChange={setEditTermType}>
              <SelectTrigger id="edit-term-type" data-testid="select-edit-term-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Rate</SelectItem>
                <SelectItem value="variable-changing">Variable Rate (Changing Payment)</SelectItem>
                <SelectItem value="variable-fixed">Variable Rate (Fixed Payment)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editTermType === "fixed" ? (
            <div className="space-y-2">
              <Label htmlFor="edit-fixed-rate">Fixed Interest Rate (%)</Label>
              <Input
                id="edit-fixed-rate"
                type="number"
                step="0.01"
                placeholder="4.99"
                value={editTermFixedRate}
                onChange={(e) => setEditTermFixedRate(e.target.value)}
                data-testid="input-edit-fixed-rate"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-prime-rate">Current Prime Rate (%)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={async () => {
                      const result = await refetchPrimeRate();
                      if (result.data?.primeRate) {
                        setEditTermPrimeRate(result.data.primeRate.toString());
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
                <Input
                  id="edit-prime-rate"
                  type="number"
                  step="0.01"
                  placeholder="4.45"
                  value={editTermPrimeRate}
                  readOnly
                  data-testid="input-edit-prime-rate"
                />
                {primeRateData && (
                  <p className="text-xs text-muted-foreground">
                    Bank of Canada rate as of {new Date(primeRateData.effectiveDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-spread">Your Spread (+/- from Prime)</Label>
                <Input
                  id="edit-spread"
                  type="number"
                  step="0.01"
                  placeholder="-0.80"
                  value={editTermSpread}
                  onChange={(e) => setEditTermSpread(e.target.value)}
                  data-testid="input-edit-spread"
                />
                <p className="text-xs text-muted-foreground">
                  Effective rate:{" "}
                  {(parseFloat(editTermPrimeRate || "0") + parseFloat(editTermSpread || "0")).toFixed(2)}%
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-payment-frequency">Payment Frequency</Label>
            <Select value={editTermPaymentFrequency} onValueChange={setEditTermPaymentFrequency}>
              <SelectTrigger id="edit-payment-frequency" data-testid="select-edit-payment-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly (12 payments/year)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (26 payments/year)</SelectItem>
                <SelectItem value="accelerated-biweekly">Accelerated Bi-weekly</SelectItem>
                <SelectItem value="semi-monthly">Semi-monthly (24 payments/year)</SelectItem>
                <SelectItem value="weekly">Weekly (52 payments/year)</SelectItem>
                <SelectItem value="accelerated-weekly">Accelerated Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-payment-amount">Regular Payment Amount ($)</Label>
            <Input
              id="edit-payment-amount"
              type="number"
              step="0.01"
              placeholder="2500.00"
              value={editTermPaymentAmount}
              onChange={(e) => setEditTermPaymentAmount(e.target.value)}
              data-testid="input-edit-payment-amount"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const currentTerm = terms?.[terms.length - 1];
              if (!currentTerm) return;

              const termYearsNum = parseInt(editTermYears) || 5;

              updateTermMutation.mutate({
                termId: currentTerm.id,
                updates: {
                  termType: editTermType,
                  startDate: editTermStartDate,
                  endDate: editTermEndDate,
                  termYears: termYearsNum,
                  paymentFrequency: editTermPaymentFrequency,
                  regularPaymentAmount: editTermPaymentAmount,
                  fixedRate: editTermType === "fixed" ? editTermFixedRate : undefined,
                  lockedSpread: editTermType !== "fixed" ? editTermSpread : undefined,
                  primeRate: editTermType !== "fixed" ? editTermPrimeRate : undefined,
                },
              });
            }}
            disabled={
              updateTermMutation.isPending ||
              !editTermPaymentAmount ||
              !editTermStartDate ||
              (editTermType === "fixed"
                ? !editTermFixedRate
                : !editTermSpread || !editTermPrimeRate)
            }
            data-testid="button-save-edit-term"
          >
            {updateTermMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

