import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useHelocAccounts, useCreateHelocAccount } from "../hooks";
import { HelocAccountCard } from "./heloc-account-card";
import { CreateHelocDialog } from "./create-heloc-dialog";
import { useState } from "react";

export function HelocDashboard() {
  const { data: accounts, isLoading } = useHelocAccounts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">HELOC Accounts</h1>
          <Button disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading HELOC accounts...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HELOC Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Home Equity Line of Credit accounts
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add HELOC Account
        </Button>
      </div>

      {!accounts || accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No HELOC Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don't have any HELOC accounts yet. Add your first account to start tracking.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First HELOC Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <HelocAccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <CreateHelocDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

