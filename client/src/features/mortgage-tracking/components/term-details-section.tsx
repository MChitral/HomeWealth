import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { RefreshCw } from "lucide-react";
import { EditTermDialog } from "./edit-term-dialog";
import { TermRenewalDialog } from "./term-renewal-dialog";
import type { UiTerm } from "../types";
import type { MortgageTerm } from "@shared/schema";
import type { PrimeRateResponse } from "../api";
import type { UseMutationResult } from "@tanstack/react-query";

interface TermDetailsSectionProps {
  currentTerm: UiTerm;
  monthsRemainingInTerm: number;
  summaryStats: {
    currentPrimeRate: number;
    currentRate: number;
  };
  // Edit term dialog state
  isEditTermOpen: boolean;
  setIsEditTermOpen: (open: boolean) => void;
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
  // Renewal dialog state
  isTermRenewalOpen: boolean;
  setIsTermRenewalOpen: (open: boolean) => void;
  renewalTermType: string;
  setRenewalTermType: (value: string) => void;
  renewalPaymentFrequency: string;
  setRenewalPaymentFrequency: (value: string) => void;
  renewalRate: string;
  setRenewalRate: (value: string) => void;
  renewalSpread: string;
  setRenewalSpread: (value: string) => void;
  renewalPrime: string;
  setRenewalPrime: (value: string) => void;
  renewalTermYears: string;
  setRenewalTermYears: (value: string) => void;
  renewalStartDate: string;
  setRenewalStartDate: (value: string) => void;
  renewalPaymentAmount: string;
  setRenewalPaymentAmount: (value: string) => void;
  // Mutations and helpers
  updateTermMutation: UseMutationResult<any, Error, { termId: string; updates: any }, unknown>;
  handleTermRenewal: () => void;
  terms?: MortgageTerm[];
  primeRateData?: PrimeRateResponse;
  isPrimeRateLoading: boolean;
  refetchPrimeRate: () => Promise<any>;
}

export function TermDetailsSection({
  currentTerm,
  monthsRemainingInTerm,
  summaryStats,
  isEditTermOpen,
  setIsEditTermOpen,
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
  isTermRenewalOpen,
  setIsTermRenewalOpen,
  renewalTermType,
  setRenewalTermType,
  renewalPaymentFrequency,
  setRenewalPaymentFrequency,
  renewalRate,
  setRenewalRate,
  renewalSpread,
  setRenewalSpread,
  renewalPrime,
  setRenewalPrime,
  renewalTermYears,
  setRenewalTermYears,
  renewalStartDate,
  setRenewalStartDate,
  renewalPaymentAmount,
  setRenewalPaymentAmount,
  updateTermMutation,
  handleTermRenewal,
  terms,
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
              editTermType={editTermType}
              setEditTermType={setEditTermType}
              editTermStartDate={editTermStartDate}
              setEditTermStartDate={setEditTermStartDate}
              editTermEndDate={editTermEndDate}
              setEditTermEndDate={setEditTermEndDate}
              editTermYears={editTermYears}
              setEditTermYears={setEditTermYears}
              editTermPaymentFrequency={editTermPaymentFrequency}
              setEditTermPaymentFrequency={setEditTermPaymentFrequency}
              editTermPaymentAmount={editTermPaymentAmount}
              setEditTermPaymentAmount={setEditTermPaymentAmount}
              editTermFixedRate={editTermFixedRate}
              setEditTermFixedRate={setEditTermFixedRate}
              editTermPrimeRate={editTermPrimeRate}
              setEditTermPrimeRate={setEditTermPrimeRate}
              editTermSpread={editTermSpread}
              setEditTermSpread={setEditTermSpread}
              terms={terms}
              updateTermMutation={updateTermMutation}
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
              termType={renewalTermType}
              setTermType={setRenewalTermType}
              paymentFrequency={renewalPaymentFrequency}
              setPaymentFrequency={setRenewalPaymentFrequency}
              termYears={renewalTermYears}
              setTermYears={setRenewalTermYears}
              startDate={renewalStartDate}
              setStartDate={setRenewalStartDate}
              fixedRate={renewalRate}
              setFixedRate={setRenewalRate}
              spread={renewalSpread}
              setSpread={setRenewalSpread}
              primeRate={renewalPrime}
              setPrimeRate={setRenewalPrime}
              paymentAmount={renewalPaymentAmount}
              setPaymentAmount={setRenewalPaymentAmount}
              onSubmit={handleTermRenewal}
              isSubmitting={false}
              currentTerm={currentTerm}
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
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

