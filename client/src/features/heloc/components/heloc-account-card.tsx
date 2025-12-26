import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { CreditCard, TrendingUp, DollarSign, Edit, Trash2 } from "lucide-react";
import type { HelocAccount } from "@shared/schema";
import {
  calculateAvailableCredit,
  calculateCreditUtilization,
} from "@server-shared/calculations/heloc/available-credit";
import { useState } from "react";
import { EditHelocDialog } from "./edit-heloc-dialog";
import { useDeleteHelocAccount } from "../hooks";
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

interface HelocAccountCardProps {
  account: HelocAccount;
}

export function HelocAccountCard({ account }: HelocAccountCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteAccount = useDeleteHelocAccount();

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

  const handleDelete = async () => {
    await deleteAccount.mutateAsync(account.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {account.accountName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{account.lenderName}</p>
            </div>
            <div className="flex gap-1">
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
        <CardContent className="space-y-4">
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
              <span className="font-semibold text-green-600">
                {formatCurrency(availableCredit)}
              </span>
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

          <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Interest Rate</span>
              <span className="font-mono">
                Prime + {Number(account.interestSpread).toFixed(3)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Max LTV</span>
              <span>{Number(account.maxLtvPercent).toFixed(1)}%</span>
            </div>
            {account.isReAdvanceable === 1 && (
              <Badge variant="outline" className="mt-2">
                Re-advanceable
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <EditHelocDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        account={account}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete HELOC Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{account.accountName}"? This action cannot be undone.
              All transaction history will be permanently deleted.
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
