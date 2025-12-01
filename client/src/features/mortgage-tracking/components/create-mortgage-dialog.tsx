import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { PrimeRateResponse } from "../api";
import { InfoTooltip } from "@/shared/ui/info-tooltip";
import { Loader2, RefreshCw } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface CreateMortgageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wizardStep: number;
  setWizardStep: Dispatch<SetStateAction<number>>;
  onNextStep: () => void;
  onSubmit: () => void;
  isCreatingMortgage: boolean;
  formValues: {
    propertyPrice: string;
    downPayment: string;
    startDate: string;
    amortization: string;
    frequency: string;
    termType: string;
    termYears: string;
    fixedRate: string;
    primeRate: string;
    spread: string;
    paymentAmount: string;
  };
  formSetters: {
    setPropertyPrice: (value: string) => void;
    setDownPayment: (value: string) => void;
    setStartDate: (value: string) => void;
    setAmortization: (value: string) => void;
    setFrequency: (value: string) => void;
    setTermType: (value: string) => void;
    setTermYears: (value: string) => void;
    setFixedRate: (value: string) => void;
    setPrimeRate: (value: string) => void;
    setSpread: (value: string) => void;
  };
  validation: {
    propertyPriceError: string;
    downPaymentError: string;
    loanAmountError: string;
    isFormValid: boolean;
    isStep2Valid: () => boolean;
  };
  autoCreatePayment: string;
  createPaymentEdited: boolean;
  onCreatePaymentChange: (value: string) => void;
  onUseAutoPayment: () => void;
  primeRateData?: PrimeRateResponse;
  onRefreshPrime: () => void;
  isPrimeRateLoading: boolean;
}

export function CreateMortgageDialog({
  open,
  onOpenChange,
  wizardStep,
  setWizardStep,
  onNextStep,
  onSubmit,
  isCreatingMortgage,
  formValues,
  formSetters,
  validation,
  autoCreatePayment,
  createPaymentEdited,
  onCreatePaymentChange,
  onUseAutoPayment,
  primeRateData,
  onRefreshPrime,
  isPrimeRateLoading,
}: CreateMortgageDialogProps) {
  const propertyPriceValue = Number(formValues.propertyPrice || 0);
  const downPaymentValue = Number(formValues.downPayment || 0);
  const loanAmountValue = propertyPriceValue - downPaymentValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {wizardStep === 1 ? "Step 1: Mortgage Details" : "Step 2: Term Details"}
          </DialogTitle>
          <DialogDescription>
            {wizardStep === 1
              ? "Enter your property and loan information"
              : "Set up your initial mortgage term with interest rate"}
          </DialogDescription>
          <div className="flex gap-2 pt-2">
            <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </DialogHeader>

        {wizardStep === 1 ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-price">Property Price ($)</Label>
                <Input
                  id="property-price"
                  type="number"
                  placeholder="500000"
                  value={formValues.propertyPrice}
                  onChange={(e) => formSetters.setPropertyPrice(e.target.value)}
                  className={validation.propertyPriceError ? "border-destructive" : ""}
                  data-testid="input-property-price"
                />
                {validation.propertyPriceError && (
                  <p className="text-sm text-destructive">{validation.propertyPriceError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="down-payment">Down Payment ($)</Label>
                <Input
                  id="down-payment"
                  type="number"
                  placeholder="100000"
                  value={formValues.downPayment}
                  onChange={(e) => formSetters.setDownPayment(e.target.value)}
                  className={
                    validation.downPaymentError || validation.loanAmountError ? "border-destructive" : ""
                  }
                  data-testid="input-down-payment"
                />
                {validation.downPaymentError && (
                  <p className="text-sm text-destructive">{validation.downPaymentError}</p>
                )}
                {validation.loanAmountError && !validation.downPaymentError && (
                  <p className="text-sm text-destructive">{validation.loanAmountError}</p>
                )}
                {!validation.downPaymentError &&
                  !validation.loanAmountError &&
                  propertyPriceValue > 0 &&
                  downPaymentValue >= 0 && (
                    <p className="text-sm text-muted-foreground font-medium">
                      Loan amount: ${Number.isFinite(loanAmountValue) ? loanAmountValue.toLocaleString() : "0"}
                    </p>
                  )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Mortgage Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formValues.startDate}
                onChange={(e) => formSetters.setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amortization-years">Amortization (years)</Label>
                <Select value={formValues.amortization} onValueChange={formSetters.setAmortization}>
                  <SelectTrigger data-testid="select-amortization">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="25">25 Years</SelectItem>
                    <SelectItem value="30">30 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-frequency">Payment Frequency</Label>
                <Select value={formValues.frequency} onValueChange={formSetters.setFrequency}>
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="accelerated-biweekly">Accelerated Bi-weekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p>
                <strong>Loan:</strong> $
                {Number.isFinite(loanAmountValue) ? loanAmountValue.toLocaleString() : "0"} over {formValues.amortization}{" "}
                years
              </p>
              <p>
                <strong>Payments:</strong> {formValues.frequency.replace("-", " ")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Mortgage Type</Label>
                  <InfoTooltip content="Fixed: Rate stays constant. Variable: Rate adjusts with Prime rate." />
                </div>
                <Select value={formValues.termType} onValueChange={formSetters.setTermType}>
                  <SelectTrigger data-testid="select-term-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Rate</SelectItem>
                    <SelectItem value="variable-changing">Variable (Changing Payment)</SelectItem>
                    <SelectItem value="variable-fixed">Variable (Fixed Payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term Length</Label>
                <Select value={formValues.termYears} onValueChange={formSetters.setTermYears}>
                  <SelectTrigger data-testid="select-term-years">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="7">7 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formValues.termType === "fixed" ? (
              <div className="space-y-2">
                <Label htmlFor="fixed-rate">Fixed Interest Rate (%)</Label>
                <Input
                  id="fixed-rate"
                  type="number"
                  step="0.01"
                  placeholder="4.99"
                  value={formValues.fixedRate}
                  onChange={(e) => formSetters.setFixedRate(e.target.value)}
                  data-testid="input-fixed-rate"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prime-rate">Current Prime Rate (%)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={onRefreshPrime}
                      disabled={isPrimeRateLoading}
                      data-testid="button-refresh-prime"
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
                    id="prime-rate"
                    type="number"
                    step="0.01"
                    placeholder="6.45"
                    value={formValues.primeRate}
                    readOnly
                    data-testid="input-prime-rate"
                  />
                  {primeRateData && (
                    <p className="text-xs text-muted-foreground">
                      Bank of Canada rate as of {new Date(primeRateData.effectiveDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spread">Your Spread (+/- from Prime)</Label>
                  <Input
                    id="spread"
                    type="number"
                    step="0.01"
                    placeholder="-0.80"
                    value={formValues.spread}
                    onChange={(e) => formSetters.setSpread(e.target.value)}
                    data-testid="input-spread"
                  />
                  <p className="text-xs text-muted-foreground">
                    Effective rate: {(Number(formValues.primeRate || "0") + Number(formValues.spread || "0")).toFixed(2)}%
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment-amount">Regular Payment Amount ($)</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                placeholder="2500.00"
                value={formValues.paymentAmount}
                onChange={(e) => onCreatePaymentChange(e.target.value)}
                data-testid="input-payment-amount"
              />
              {autoCreatePayment && (
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Auto payment: ${autoCreatePayment}</span>
                  {createPaymentEdited && (
                    <Button variant="ghost" size="sm" onClick={onUseAutoPayment}>
                      Use auto
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {wizardStep === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onNextStep} disabled={!validation.isFormValid} data-testid="button-next-step">
                Next: Term Details
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setWizardStep(1)}>
                Back
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isCreatingMortgage || !validation.isStep2Valid()}
                data-testid="button-create-mortgage-term"
              >
                {isCreatingMortgage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Mortgage
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

