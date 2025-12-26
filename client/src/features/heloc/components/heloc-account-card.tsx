import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import {
  CreditCard,
  Edit,
  Trash2,
  Link as LinkIcon,
  TrendingUp,
  History,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import type { HelocAccount } from "@shared/schema";
import { calculateAvailableCredit, calculateCreditUtilization } from "@/shared/utils/heloc";
import { useState } from "react";
import { EditHelocDialog } from "./edit-heloc-dialog";
import { BorrowDialog } from "./borrow-dialog";
import { PaymentDialog } from "./payment-dialog";
import { useDeleteHelocAccount } from "../hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks/use-mortgage-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { HelocTransactionList } from "./heloc-transaction-list";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { cn } from "@/shared/lib/utils";

interface HelocAccountCardProps {
  account: HelocAccount;
}

export function HelocAccountCard({ account }: HelocAccountCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const deleteAccount = useDeleteHelocAccount();
  const { mortgages } = useMortgageData();
  
  // Fetch current prime rate for interest calculations
  const { data: primeRateData } = useQuery({
    queryKey: ["prime-rate"],
    queryFn: () => mortgageApi.fetchPrimeRate(),
  });

  const linkedMortgage = account.mortgageId
    ? mortgages.find((m) => m.id === account.mortgageId)
    : null;

  const creditLimit = Number(account.creditLimit);
  const currentBalance = Number(account.currentBalance);
  const availableCredit = calculateAvailableCredit(creditLimit, currentBalance);
  const utilization = calculateCreditUtilization(currentBalance, creditLimit);

  // Strategy Calculation Values
  const homeValue = linkedMortgage
    ? Number(linkedMortgage.propertyPrice)
    : Number(account.homeValueReference) || 0;
  const mortgageBalance = linkedMortgage ? Number(linkedMortgage.currentBalance) : 0;
  const maxLtv = Number(account.maxLtvPercent) / 100;

  // Rule: Credit Limit = (Home Value * Max LTV) - Mortgage Balance
  // (Note: This is the theoretical limit, the actual limit stored in DB might differ if manually set or capped)
  const theoreticalLimit = homeValue * maxLtv - mortgageBalance;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDelete = async () => {
    await deleteAccount.mutateAsync(account.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 overflow-hidden">
              <CardTitle className="text-lg flex items-center gap-2 truncate">
                <CreditCard className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{account.accountName}</span>
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{account.lenderName}</p>
                {linkedMortgage && (
                  <Badge variant="secondary" className="text-xs gap-1 h-5 px-1.5 font-normal">
                    <LinkIcon className="h-3 w-3" />
                    Linked to Mortgage
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 pb-3">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Available
              </span>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(availableCredit)}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Balance
              </span>
              <div
                className={cn(
                  "text-2xl font-bold",
                  currentBalance > 0 ? "text-primary" : "text-muted-foreground"
                )}
              >
                {formatCurrency(currentBalance)}
              </div>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Credit Limit: {formatCurrency(creditLimit)}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="p-4 w-80">
                      <div className="space-y-2">
                        <p className="font-semibold border-b pb-1 mb-2">Credit Limit Calculation</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <span className="text-muted-foreground">Home Value:</span>
                          <span className="text-right font-mono">{formatCurrency(homeValue)}</span>

                          <span className="text-muted-foreground">
                            Max LTV ({Number(account.maxLtvPercent)}%):
                          </span>
                          <span className="text-right font-mono">
                            {formatCurrency(homeValue * maxLtv)}
                          </span>

                          <span className="text-muted-foreground">Less Mortgage:</span>
                          <span className="text-right font-mono text-destructive">
                            -{formatCurrency(mortgageBalance)}
                          </span>

                          <div className="col-span-2 border-t pt-1 mt-1 flex justify-between font-bold">
                            <span>Calculated Limit:</span>
                            <span>{formatCurrency(theoreticalLimit)}</span>
                          </div>
                        </div>
                        {Math.abs(creditLimit - theoreticalLimit) > 1 && (
                          <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 p-2 rounded">
                            Note: Actual limit differs from calculated limit (Manually set or
                            capped).
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span
                className={cn(
                  "font-medium",
                  utilization > 80
                    ? "text-destructive"
                    : utilization > 50
                      ? "text-yellow-600"
                      : "text-primary"
                )}
              >
                {utilization.toFixed(1)}% Used
              </span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>

          {/* Strategy / Breakdown Accordion */}
          <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="details" className="border-0">
              <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline hover:bg-muted/50 rounded-t-md">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Account Details & Strategy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-1 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-mono font-medium">
                    Prime + {Number(account.interestSpread).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Monthly Interest (Est.)</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(
                      (currentBalance *
                        ((primeRateData?.primeRate || 7.2) + Number(account.interestSpread)) /
                        100) /
                        12
                    )}
                  </span>
                </div>
                {linkedMortgage && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-2">
                    <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                      Re-advanceable Strategy
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      Every $1.00 of mortgage principal paid increases your HELOC limit by up to
                      $1.00 (depending on LTV cap).
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>

        {/* Actions Footer */}
        <CardFooter className="grid grid-cols-3 gap-2 bg-muted/20 p-3 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => setIsBorrowDialogOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Borrow
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            <Minus className="h-3 w-3 mr-1.5" />
            Pay
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => setIsHistoryDialogOpen(true)}
          >
            <History className="h-3 w-3 mr-1.5" />
            History
          </Button>
        </CardFooter>
      </Card>

      <EditHelocDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        account={account}
      />

      <BorrowDialog
        open={isBorrowDialogOpen}
        onOpenChange={setIsBorrowDialogOpen}
        account={account}
      />

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        account={account}
      />

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>
          <HelocTransactionList account={account} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete HELOC Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{account.accountName}&quot;? This action cannot
              be undone. All transaction history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
