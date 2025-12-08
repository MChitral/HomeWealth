import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { RefreshCw } from "lucide-react";
import { EditTermDialog } from "./edit-term-dialog";
import { TermRenewalDialog } from "./term-renewal-dialog";
import type { UiTerm } from "../types";
import type { UseFormReturn } from "react-hook-form";
import type { EditTermFormData } from "../hooks/use-edit-term-form";
import type { TermRenewalFormData } from "../hooks/use-term-renewal-form";

interface TermDetailsSectionProps {
  currentTerm: UiTerm;
  monthsRemainingInTerm: number;
  summaryStats: {
    currentPrimeRate: number;
    currentRate: number;
  };
  // Edit term form
  isEditTermOpen: boolean;
  setIsEditTermOpen: (open: boolean) => void;
  editTermForm: UseFormReturn<EditTermFormData>;
  editTermOnSubmit: () => void;
  editTermIsSubmitting: boolean;
  editTermIsValid: boolean;
  // Renewal form (for existing term renewal)
  isTermRenewalOpen: boolean;
  setIsTermRenewalOpen: (open: boolean) => void;
  renewalForm: UseFormReturn<TermRenewalFormData>;
  renewalOnSubmit: () => void;
  renewalIsSubmitting: boolean;
  renewalIsValid: boolean;
  renewalAutoPaymentAmount?: string;
  renewalPaymentEdited?: boolean;
  renewalOnPaymentAmountChange?: (value: string) => void;
  renewalOnUseAutoPayment?: () => void;
  // Prime rate
  primeRateData?: import("../api").PrimeRateResponse;
  isPrimeRateLoading: boolean;
  refetchPrimeRate: () => Promise<any> | void;
}

export function TermDetailsSection({
  currentTerm,
  monthsRemainingInTerm,
  summaryStats,
  isEditTermOpen,
  setIsEditTermOpen,
  editTermForm,
  editTermOnSubmit,
  editTermIsSubmitting,
  editTermIsValid,
  isTermRenewalOpen,
  setIsTermRenewalOpen,
  renewalForm,
  renewalOnSubmit,
  renewalIsSubmitting,
  renewalIsValid,
  renewalAutoPaymentAmount,
  renewalPaymentEdited,
  renewalOnPaymentAmountChange,
  renewalOnUseAutoPayment,
  primeRateData,
  isPrimeRateLoading,
  refetchPrimeRate,
}: TermDetailsSectionProps) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-xl font-semibold">Current Mortgage Term</CardTitle>
            <CardDescription>Your locked rate/spread for this term period</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <EditTermDialog
              open={isEditTermOpen}
              onOpenChange={setIsEditTermOpen}
              triggerButton={
                <Button variant="outline" size="sm" data-testid="button-edit-term">
                  Edit Term
                </Button>
              }
              form={editTermForm}
              onSubmit={editTermOnSubmit}
              isSubmitting={editTermIsSubmitting}
              isValid={editTermIsValid}
              primeRateData={primeRateData}
              isPrimeRateLoading={isPrimeRateLoading}
              refetchPrimeRate={refetchPrimeRate}
            />
            <TermRenewalDialog
              open={isTermRenewalOpen}
              onOpenChange={setIsTermRenewalOpen}
              triggerButton={
                <Button variant="outline" size="sm" data-testid="button-renew-term">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renew Term
                </Button>
              }
              form={renewalForm}
              onSubmit={renewalOnSubmit}
              isSubmitting={renewalIsSubmitting}
              isValid={renewalIsValid}
              autoPaymentAmount={renewalAutoPaymentAmount}
              paymentEdited={renewalPaymentEdited}
              onPaymentAmountChange={renewalOnPaymentAmountChange}
              onUseAutoPayment={renewalOnUseAutoPayment}
              currentTerm={currentTerm}
              primeRateData={primeRateData}
              onRefreshPrime={refetchPrimeRate}
              isPrimeRateLoading={isPrimeRateLoading}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Term Type</p>
            <p className="text-base font-medium">
              {currentTerm.termType === "fixed" ? "Fixed Rate" :
               currentTerm.termType === "variable-changing" ? "Variable (Changing Payment)" :
               "Variable (Fixed Payment)"}
            </p>
            <Badge variant="outline" className="mt-2">
              {currentTerm.termType === "fixed" && "Fixed"}
              {currentTerm.termType === "variable-changing" && "VRM - Changing"}
              {currentTerm.termType === "variable-fixed" && "VRM - Fixed"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Payment Frequency</p>
            <p className="text-base font-medium">
              {currentTerm.paymentFrequency === "monthly" && "Monthly"}
              {currentTerm.paymentFrequency === "biweekly" && "Bi-weekly"}
              {currentTerm.paymentFrequency === "accelerated-biweekly" && "Accelerated Bi-weekly"}
              {currentTerm.paymentFrequency === "semi-monthly" && "Semi-monthly"}
              {currentTerm.paymentFrequency === "weekly" && "Weekly"}
              {currentTerm.paymentFrequency === "accelerated-weekly" && "Accelerated Weekly"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentTerm.paymentFrequency === "monthly" && "12 payments/year"}
              {currentTerm.paymentFrequency === "biweekly" && "26 payments/year"}
              {currentTerm.paymentFrequency === "accelerated-biweekly" && "26 payments/year + extra"}
              {currentTerm.paymentFrequency === "semi-monthly" && "24 payments/year"}
              {currentTerm.paymentFrequency === "weekly" && "52 payments/year"}
              {currentTerm.paymentFrequency === "accelerated-weekly" && "52 payments/year + extra"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Regular Payment</p>
            <p className="text-base font-medium font-mono" data-testid="text-regular-payment">
              ${currentTerm.regularPaymentAmount ? Number(currentTerm.regularPaymentAmount).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Principal & Interest
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Term Duration</p>
            <p className="text-base font-medium">{currentTerm.termYears} years</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ends {currentTerm.endDate}
            </p>
            <p className="text-xs text-muted-foreground">{monthsRemainingInTerm} months left</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {currentTerm.termType === "fixed" ? "Locked Rate" : "Locked Spread"}
            </p>
            <p className="text-base font-medium font-mono">
              {currentTerm.termType === "fixed"
                ? `${currentTerm.fixedRate}%`
                : `Prime ${currentTerm.lockedSpread >= 0 ? '+' : ''}${currentTerm.lockedSpread}%`
              }
            </p>
            {/* Debug: Log stored spread value */}
            {currentTerm.termType !== "fixed" && (
              <p className="text-xs text-muted-foreground mt-1" style={{ display: 'none' }}>
                Stored Spread: {currentTerm.lockedSpread}%
              </p>
            )}
          </div>
        </div>
        {currentTerm.termType !== "fixed" && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Prime Rate</p>
                <p className="text-2xl font-mono font-bold">{summaryStats.currentPrimeRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Effective Rate</p>
                <p className="text-2xl font-mono font-bold">{summaryStats.currentRate}%</p>
                {/* Debug info - shows calculation */}
                <p className="text-xs text-muted-foreground mt-1">
                  Prime {summaryStats.currentPrimeRate}% + Spread {currentTerm.lockedSpread >= 0 ? '+' : ''}{currentTerm.lockedSpread}%
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

