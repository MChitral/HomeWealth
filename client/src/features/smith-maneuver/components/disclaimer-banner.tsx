import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Important Disclaimer</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          <strong>This tool provides educational modeling only, not tax advice.</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Tax laws may change and affect strategy viability</li>
          <li>Individual circumstances vary - consult a tax professional</li>
          <li>CRA interpretation may differ from model assumptions</li>
          <li>No guarantee of tax deduction acceptance</li>
          <li>Investment returns are not guaranteed</li>
          <li>Leverage amplifies both gains and losses</li>
        </ul>
        <p className="text-sm font-semibold mt-2">
          Professional tax and investment advice is strongly recommended before implementing the Smith Maneuver.
        </p>
      </AlertDescription>
    </Alert>
  );
}

