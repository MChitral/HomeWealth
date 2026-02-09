import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

export function DisclaimerBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Alert
      className="cursor-pointer border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20"
      data-testid="smith-disclaimer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Educational modeling only — not tax advice. Consult a professional before implementing.
          </p>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-yellow-600 dark:text-yellow-500 transition-transform flex-shrink-0 ml-2",
              isExpanded && "rotate-180"
            )}
          />
        </div>
        {isExpanded && (
          <ul className="mt-2 list-disc list-inside space-y-0.5 text-xs text-yellow-700 dark:text-yellow-300" data-testid="smith-disclaimer-details">
            <li>Tax laws may change and affect strategy viability</li>
            <li>CRA interpretation may differ from model assumptions</li>
            <li>Investment returns are not guaranteed</li>
            <li>Leverage amplifies both gains and losses</li>
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
