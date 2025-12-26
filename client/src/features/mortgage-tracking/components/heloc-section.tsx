import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { CreditCard, ExternalLink, Loader2, TrendingUp } from "lucide-react";
import { helocApi } from "@/features/heloc/api";
import {
  calculateAvailableCredit,
  calculateCreditUtilization,
} from "@server-shared/calculations/heloc/available-credit";
import { CreditRoomDisplay } from "./credit-room-display";
import { CreditRoomHistory } from "./credit-room-history";
import { MarkReAdvanceableDialog } from "./mark-re-advanceable-dialog";
import { PropertyValueUpdateDialog } from "./property-value-update-dialog";
import { PropertyValueHistory } from "./property-value-history";
import type { HelocAccount, Mortgage } from "@shared/schema";

interface HelocSectionProps {
  mortgageId: string;
  mortgage?: Mortgage | null;
}

export function HelocSection({ mortgageId, mortgage }: HelocSectionProps) {
  const [isMarkReAdvanceableOpen, setIsMarkReAdvanceableOpen] = useState(false);
  const [isCreditRoomHistoryOpen, setIsCreditRoomHistoryOpen] = useState(false);
  const [isPropertyValueUpdateOpen, setIsPropertyValueUpdateOpen] = useState(false);
  const { data: allAccounts, isLoading } = useQuery({
    queryKey: ["/api/heloc/accounts"],
    queryFn: () => helocApi.fetchAccounts(),
  });

  // Filter accounts linked to this mortgage
  const linkedAccounts = allAccounts?.filter((account) => account.mortgageId === mortgageId) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading HELOC accounts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (linkedAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Linked HELOC Accounts
          </CardTitle>
          <CardDescription>HELOC accounts linked to this mortgage will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No HELOC accounts are currently linked to this mortgage. Link a HELOC account to see
            credit limit impacts from prepayments.
          </p>
          <Button asChild variant="outline">
            <Link href="/heloc">
              <ExternalLink className="h-4 w-4 mr-2" />
              View HELOC Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isReAdvanceable = mortgage?.isReAdvanceable === 1;

  return (
    <div className="space-y-6">
      {/* Re-advanceable Mortgage Section */}
      {isReAdvanceable ? (
        <CreditRoomDisplay
          mortgageId={mortgageId}
          onViewHistory={() => setIsCreditRoomHistoryOpen(true)}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Re-advanceable Mortgage
            </CardTitle>
            <CardDescription>
              Mark this mortgage as re-advanceable to enable automatic credit room updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Re-advanceable mortgages automatically increase your HELOC credit room as you make
              principal payments. This enables seamless access to your home equity.
            </p>
            <Button onClick={() => setIsMarkReAdvanceableOpen(true)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Mark as Re-advanceable
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Linked HELOC Accounts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Linked HELOC Accounts
            </h3>
            <p className="text-sm text-muted-foreground">
              {linkedAccounts.length} account{linkedAccounts.length !== 1 ? "s" : ""} linked to this
              mortgage
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/heloc">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All HELOC Accounts
            </Link>
          </Button>
        </div>

        {linkedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedAccounts.map((account) => (
              <HelocAccountSummaryCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                No HELOC accounts are currently linked to this mortgage. Link a HELOC account to see
                credit limit impacts from prepayments.
              </p>
              <Button asChild variant="outline">
                <Link href="/heloc">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Create HELOC Account
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Property Value Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Property Value</CardTitle>
              <CardDescription>Track property value to update HELOC credit limits</CardDescription>
            </div>
            {mortgage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPropertyValueUpdateOpen(true)}
              >
                Update Value
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mortgage && (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Current Property Value</p>
                <p className="text-2xl font-bold">
                  $
                  {Number(mortgage.propertyPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <PropertyValueHistory mortgageId={mortgageId} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <MarkReAdvanceableDialog
        open={isMarkReAdvanceableOpen}
        onOpenChange={setIsMarkReAdvanceableOpen}
        mortgageId={mortgageId}
      />

      <Dialog open={isCreditRoomHistoryOpen} onOpenChange={setIsCreditRoomHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Credit Room History</DialogTitle>
          </DialogHeader>
          <CreditRoomHistory mortgageId={mortgageId} />
        </DialogContent>
      </Dialog>

      {mortgage && (
        <PropertyValueUpdateDialog
          open={isPropertyValueUpdateOpen}
          onOpenChange={setIsPropertyValueUpdateOpen}
          mortgageId={mortgageId}
          currentPropertyPrice={Number(mortgage.propertyPrice)}
        />
      )}
    </div>
  );
}

function HelocAccountSummaryCard({ account }: { account: HelocAccount }) {
  const creditLimit = Number(account.creditLimit);
  const currentBalance = Number(account.currentBalance);
  const availableCredit = calculateAvailableCredit(creditLimit, currentBalance);
  const utilization = calculateCreditUtilization(currentBalance, creditLimit);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{account.accountName}</CardTitle>
            <CardDescription>{account.lenderName}</CardDescription>
          </div>
          {account.isReAdvanceable === 1 && <Badge variant="outline">Re-advanceable</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credit Limit</span>
            <span className="font-semibold">{formatCurrency(creditLimit)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="font-semibold">{formatCurrency(currentBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available Credit</span>
            <span className="font-semibold text-green-600">{formatCurrency(availableCredit)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Credit Utilization</span>
            <Badge
              variant={
                utilization > 80 ? "destructive" : utilization > 50 ? "default" : "secondary"
              }
            >
              {utilization.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={utilization} className="h-2" />
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Interest Rate</span>
            <span className="font-mono">Prime + {Number(account.interestSpread).toFixed(3)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
