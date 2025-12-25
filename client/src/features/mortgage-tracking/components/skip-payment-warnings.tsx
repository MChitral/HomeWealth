import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertTriangle, Info, TrendingUp, DollarSign, Calendar } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

/**
 * Educational component about payment skipping consequences
 */
export function SkipPaymentWarnings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-indigo-500" />
          Understanding Payment Skipping
        </CardTitle>
        <CardDescription>
          Important information about skipping mortgage payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Skipping payments has significant financial consequences.
            Always consider your options carefully and consult with your lender if needed.
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="negative-amortization">
            <AccordionTrigger>What is Negative Amortization?</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p>
                When you skip a payment, you don't pay any principal or interest. However, interest
                still accrues during the skipped period and is added to your mortgage balance.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Example:</p>
                <p className="text-sm">
                  If your balance is $400,000 and you skip a payment with a 5% interest rate, you
                  will accrue approximately $1,667 in interest (depending on payment frequency). This
                  interest is added to your balance, so your new balance becomes $401,667.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                This is called "negative amortization" because your balance increases instead of
                decreasing.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="extended-amortization">
            <AccordionTrigger>Extended Amortization Period</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p>
                When your balance increases due to skipped payments, your amortization period
                extends. This means it will take longer to pay off your mortgage.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Impact:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Your mortgage term may extend by several months or years</li>
                  <li>You'll pay more interest over the life of the mortgage</li>
                  <li>Your monthly payments remain the same, but more goes to interest</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="interest-compounding">
            <AccordionTrigger>Interest on Interest</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p>
                When interest is added to your principal balance, you'll pay interest on that
                interest in future periods. This compounding effect increases your total interest
                paid over time.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Example:</p>
                <p className="text-sm">
                  If you skip a payment and accrue $1,667 in interest, you'll pay interest on that
                  $1,667 in all future periods. Over a 25-year mortgage, this can add hundreds or
                  thousands of dollars to your total interest paid.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="skip-limits">
            <AccordionTrigger>Skip Limits and Rules</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p>
                Most Canadian lenders limit the number of payments you can skip per calendar year,
                typically 1-2 payments.
              </p>
              <div className="bg-muted p-3 rounded-md space-y-2">
                <p className="text-sm font-medium">Common Rules:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Limit resets on January 1st each year</li>
                  <li>Cannot skip consecutive payments in most cases</li>
                  <li>May require lender approval</li>
                  <li>Some lenders may charge fees for skipping</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Always check with your lender for specific rules and requirements.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="when-to-skip">
            <AccordionTrigger>When Should You Skip a Payment?</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p>
                Payment skipping should be used carefully and only when necessary. Consider
                skipping if:
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>You're experiencing temporary financial hardship</li>
                  <li>You have unexpected expenses (medical, home repairs, etc.)</li>
                  <li>You have seasonal income variations</li>
                  <li>You need short-term cash flow relief</li>
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-md mt-2">
                <p className="text-sm font-medium mb-1">Avoid skipping if:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>You can make the payment with minor budget adjustments</li>
                  <li>You have other sources of credit available</li>
                  <li>You're already at your skip limit</li>
                  <li>You're planning to refinance soon</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="alternatives">
            <AccordionTrigger>Alternatives to Skipping</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p>Before skipping a payment, consider these alternatives:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-muted rounded">
                  <DollarSign className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Reduce Other Expenses</p>
                    <p className="text-xs text-muted-foreground">
                      Temporarily cut back on discretionary spending
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted rounded">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Use Emergency Fund</p>
                    <p className="text-xs text-muted-foreground">
                      If you have savings, use them instead of skipping
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted rounded">
                  <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Contact Your Lender</p>
                    <p className="text-xs text-muted-foreground">
                      Discuss payment deferral or modification options
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Remember:</strong> This tool is for planning purposes only. Always confirm skip
            eligibility and terms with your lender before skipping a payment. Lender policies may
            vary, and some may require advance notice or approval.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

