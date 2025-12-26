import { Button } from "@/shared/ui/button";
import { PlusCircle, DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { Link } from "wouter";

interface ActionCenterProps {
  onLogPayment: () => void;
  onUpdateRate: () => void;
}

export function ActionCenter({ onLogPayment, onUpdateRate }: ActionCenterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 group"
        onClick={onLogPayment}
      >
        <PlusCircle className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
        <div className="text-xs font-medium">Log Payment</div>
      </Button>

      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col gap-2 hover:border-green-500/50 hover:bg-green-50/50 group"
        onClick={onLogPayment} // For now reusing log payment dialog, but ideally opens specific tab
      >
        <DollarSign className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
        <div className="text-xs font-medium">Lump Sum</div>
      </Button>

      <Link href="/scenarios/new" className="contents">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2 hover:border-purple-500/50 hover:bg-purple-50/50 group"
        >
          <TrendingUp className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-medium">New Scenario</div>
        </Button>
      </Link>

      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col gap-2 hover:border-orange-500/50 hover:bg-orange-50/50 group"
        onClick={onUpdateRate}
      >
        <RefreshCw className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
        <div className="text-xs font-medium">Update Rate</div>
      </Button>
    </div>
  );
}
