import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useHelocAccounts } from "../hooks";
import { HelocAccountCard } from "./heloc-account-card";
import { CreateHelocDialog } from "./create-heloc-dialog";
import { EquityStrategyDashboard } from "./equity-strategy-dashboard";
import { useState } from "react";

export function HelocDashboard() {
  const { data: accounts, isLoading } = useHelocAccounts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Equity Strategy</h1>
          <Button disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading strategy data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAccounts = accounts && accounts.length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equity Strategy</h1>
            <p className="text-muted-foreground">
              Manage your home equity liquidity and borrowing power.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {hasAccounts ? (
        <>
          {/* Top Section: Strategy Visualization */}
          <section>
            <EquityStrategyDashboard />
          </section>

          {/* Bottom Section: Accounts List */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Your HELOC Accounts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <HelocAccountCard key={account.id} account={account} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start Your Equity Strategy</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No HELOC Accounts Linked</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Add your Home Equity Line of Credit to visualize your available borrowing power and
              track the &quot;Smith Manoeuvre&quot; potential.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First HELOC Account
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateHelocDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
