import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info, ExternalLink, Shield, DollarSign, Percent, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

/**
 * Educational component about mortgage default insurance
 */
export function InsuranceInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          Mortgage Default Insurance Guide
        </CardTitle>
        <CardDescription>
          Learn about mortgage default insurance, when it's required, and how it works
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Mortgage default insurance protects lenders if borrowers default on their mortgage
            payments. It's required for high-ratio mortgages in Canada.
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="when-required">
            <AccordionTrigger>When is Insurance Required?</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <p>
                  <strong>High-Ratio Mortgages:</strong> Insurance is required when your down payment
                  is less than 20% of the property purchase price.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Down payment &lt; 20% = High-ratio mortgage (insurance required)</li>
                  <li>Down payment ≥ 20% = Conventional mortgage (no insurance required)</li>
                </ul>
                <p className="text-sm">
                  <strong>Minimum Down Payments in Canada:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Properties under $500,000: Minimum 5% down</li>
                  <li>Properties $500,000-$999,999: 5% on first $500,000, 10% on remainder</li>
                  <li>Properties $1,000,000+: Minimum 20% down (no insurance available)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-works">
            <AccordionTrigger>How Does It Work?</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <p>
                  <strong>Premium Calculation:</strong> The insurance premium is calculated as a
                  percentage of your mortgage amount, based on your Loan-to-Value (LTV) ratio.
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">LTV Ratio Formula:</p>
                  <p className="text-sm text-muted-foreground">
                    LTV = (Mortgage Amount ÷ Property Price) × 100
                  </p>
                </div>
                <p className="text-sm">
                  <strong>Premium Rates:</strong> Rates typically range from 0.60% to 4.00% of the
                  mortgage amount, depending on your LTV ratio. Higher LTV ratios result in higher
                  premium rates.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment-options">
            <AccordionTrigger>Premium Payment Options</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <strong>Option 1: Pay Upfront</strong>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay the full premium amount at closing. Your mortgage amount remains the original
                    loan amount.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="h-4 w-4 text-green-500" />
                    <strong>Option 2: Add to Principal</strong>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add the premium to your mortgage principal. You'll pay it over the life of your
                    mortgage along with your regular payments. This increases your total mortgage
                    amount.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mli-select">
            <AccordionTrigger>MLI Select Discounts</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <p>
                  <strong>MLI Select Program:</strong> Offers premium discounts for certain
                  properties and borrower profiles.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-medium">10% Discount:</span>
                    <span className="text-sm text-muted-foreground">
                      Standard properties, certain borrower profiles
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium">20% Discount:</span>
                    <span className="text-sm text-muted-foreground">
                      Energy-efficient homes, certain locations, specific programs
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium">30% Discount:</span>
                    <span className="text-sm text-muted-foreground">
                      Specific CMHC programs (verify current availability)
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Eligibility criteria change over time. Always verify current requirements with your
                  lender and insurance provider.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="providers">
            <AccordionTrigger>Insurance Providers</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-3">
                <div>
                  <strong>CMHC (Canada Mortgage and Housing Corporation)</strong>
                  <p className="text-sm text-muted-foreground">
                    Crown corporation, the largest provider of mortgage default insurance in Canada.
                  </p>
                </div>
                <div>
                  <strong>Sagen</strong>
                  <p className="text-sm text-muted-foreground">
                    Private insurer (formerly Genworth Canada). Offers competitive rates and
                    flexible options.
                  </p>
                </div>
                <div>
                  <strong>Genworth</strong>
                  <p className="text-sm text-muted-foreground">
                    Private insurer providing mortgage default insurance across Canada.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Premium rates may vary slightly between providers. Compare options to find the best
                  rate for your situation.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Official Resources
          </h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <a
                href="https://www.cmhc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                CMHC Official Website
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <a
                href="https://www.sagen.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Sagen Official Website
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <a
                href="https://www.genworth.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Genworth Official Website
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

