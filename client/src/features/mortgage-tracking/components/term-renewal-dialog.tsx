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
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Separator } from "@/shared/ui/separator";
import { Info, Loader2 } from "lucide-react";
import { InfoTooltip } from "@/shared/ui/info-tooltip";
import type { UiTerm } from "../types";

interface TermRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Dialog configuration
  title?: string;
  description?: string;
  showAlert?: boolean;
  alertMessage?: string;
  defaultStartDate?: string;
  triggerButton?: React.ReactNode;
  // Form state
  termType: string;
  setTermType: (value: string) => void;
  paymentFrequency: string;
  setPaymentFrequency: (value: string) => void;
  termYears: string;
  setTermYears: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  fixedRate: string;
  setFixedRate: (value: string) => void;
  spread: string;
  setSpread: (value: string) => void;
  primeRate: string;
  setPrimeRate: (value: string) => void;
  paymentAmount: string;
  setPaymentAmount: (value: string) => void;
  // Auto payment feature (optional)
  autoPaymentAmount?: string;
  paymentEdited?: boolean;
  setPaymentEdited?: (edited: boolean) => void;
  // Submission
  onSubmit: () => void;
  isSubmitting: boolean;
  // Validation
  isSubmitDisabled?: boolean;
  // Current term (for renewal context)
  currentTerm?: UiTerm | null;
}

export function TermRenewalDialog({
  open,
  onOpenChange,
  title = "Renew Mortgage Term",
  description = "Start a new term with a new rate or spread (typically every 3-5 years)",
  showAlert = true,
  alertMessage,
  defaultStartDate,
  triggerButton,
  termType,
  setTermType,
  paymentFrequency,
  setPaymentFrequency,
  termYears,
  setTermYears,
  startDate,
  setStartDate,
  fixedRate,
  setFixedRate,
  spread,
  setSpread,
  primeRate,
  setPrimeRate,
  paymentAmount,
  setPaymentAmount,
  autoPaymentAmount,
  paymentEdited,
  setPaymentEdited,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
  currentTerm,
}: TermRenewalDialogProps) {
  const effectiveStartDate = startDate || defaultStartDate || currentTerm?.endDate || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {showAlert && (alertMessage || currentTerm) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {alertMessage || `Your current term ends on ${currentTerm?.endDate}. Use this dialog to negotiate a new term with your lender.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-term-start">New Term Start Date</Label>
            <Input
              id="new-term-start"
              type="date"
              value={effectiveStartDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-term-start-date"
            />
            <p className="text-sm text-muted-foreground">
              Usually the day after your current term ends
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="new-term-type">Mortgage Type</Label>
              <InfoTooltip content="Fixed Rate: Interest rate stays the same for the entire term. Variable-Changing Payment: Your payment adjusts when Prime rate changes. Variable-Fixed Payment: Payment stays constant, but if Prime rises too much, you may hit the 'trigger rate' where payment doesn't cover interest." />
            </div>
            <Select value={termType} onValueChange={setTermType}>
              <SelectTrigger id="new-term-type" data-testid="select-term-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Rate</SelectItem>
                <SelectItem value="variable-changing">Variable Rate (Changing Payment)</SelectItem>
                <SelectItem value="variable-fixed">Variable Rate (Fixed Payment)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {termType === "fixed" && "Rate stays constant for the term"}
              {termType === "variable-changing" && "Payment recalculates when Prime changes"}
              {termType === "variable-fixed" && "Payment stays same, amortization extends if Prime rises"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-frequency">Payment Frequency</Label>
            <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
              <SelectTrigger id="payment-frequency" data-testid="select-payment-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly (12 payments/year)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (26 payments/year)</SelectItem>
                <SelectItem value="accelerated-biweekly">Accelerated Bi-weekly (pays off faster)</SelectItem>
                <SelectItem value="semi-monthly">Semi-monthly (24 payments/year)</SelectItem>
                <SelectItem value="weekly">Weekly (52 payments/year)</SelectItem>
                <SelectItem value="accelerated-weekly">Accelerated Weekly (pays off faster)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Accelerated payments pay your mortgage off faster by making the equivalent of one extra monthly payment per year
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="term-length">Term Length</Label>
            <Select value={termYears} onValueChange={setTermYears}>
              <SelectTrigger id="term-length" data-testid="select-term-length">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Year</SelectItem>
                <SelectItem value="2">2 Years</SelectItem>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="7">7 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Most Canadian mortgages are 3 or 5 year terms
            </p>
          </div>

          <Separator />

          {termType === "fixed" ? (
            <div className="space-y-2">
              <Label htmlFor="new-fixed-rate">Fixed Rate (%)</Label>
              <Input
                id="new-fixed-rate"
                type="number"
                step="0.01"
                placeholder="5.49"
                value={fixedRate}
                onChange={(e) => setFixedRate(e.target.value)}
                data-testid="input-fixed-rate"
              />
              <p className="text-sm text-muted-foreground">
                This rate will be locked for the entire {termYears}-year term
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-spread">Negotiated Spread (Prime ± %)</Label>
                <Input
                  id="new-spread"
                  type="number"
                  step="0.01"
                  placeholder="-0.65"
                  value={spread}
                  onChange={(e) => setSpread(e.target.value)}
                  data-testid="input-spread"
                />
                <p className="text-sm text-muted-foreground">
                  Your lender offers Prime minus 0.65% (or Prime plus X%). This spread is locked for your term.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-prime">Current Prime Rate (%)</Label>
                <Input
                  id="current-prime"
                  type="number"
                  step="0.01"
                  placeholder="6.45"
                  value={primeRate}
                  readOnly
                  data-testid="input-current-prime"
                />
                <p className="text-sm text-muted-foreground">
                  Current Bank of Canada Prime rate. This will change during your term, but your spread won't.
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="new-payment-amount">Regular Payment Amount ($)</Label>
            <Input
              id="new-payment-amount"
              type="number"
              step="0.01"
              placeholder="2100.00"
              value={paymentAmount}
              onChange={(e) => {
                setPaymentAmount(e.target.value);
                if (setPaymentEdited) {
                  setPaymentEdited(true);
                }
              }}
              data-testid="input-payment-amount"
            />
            {autoPaymentAmount && (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Auto payment: ${autoPaymentAmount}</span>
                {paymentEdited && setPaymentEdited && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPaymentEdited(false);
                      setPaymentAmount(autoPaymentAmount);
                    }}
                  >
                    Use auto
                  </Button>
                )}
              </div>
            )}
            {!autoPaymentAmount && (
              <p className="text-sm text-muted-foreground">
                Your regular payment amount for this term. This can be calculated based on your balance and rate.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-renewal">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isSubmitDisabled !== undefined
                ? isSubmitDisabled
                : !effectiveStartDate ||
                  !termYears ||
                  (termType === "fixed" && !fixedRate) ||
                  (termType.startsWith("variable") && (!spread || !primeRate)) ||
                  !paymentAmount ||
                  isSubmitting
            }
            data-testid="button-save-renewal"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start New Term
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

