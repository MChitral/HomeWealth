import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { TrendingUp, DollarSign, Home, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Canadian Mortgage Strategy
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Compare prepayment strategies and build wealth with confidence
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Sign In to Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Your Mortgage</CardTitle>
              </div>
              <CardDescription>
                Canadian-specific mortgage tracking with semi-annual compounding, 
                variable rates, and term-based renewals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Model Scenarios</CardTitle>
              </div>
              <CardDescription>
                Create up to 4 financial scenarios and compare aggressive 
                prepayment vs balanced vs investment-focused strategies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Project Net Worth</CardTitle>
              </div>
              <CardDescription>
                See 10, 20, and 30-year projections of mortgage payoff, 
                investment growth, and total net worth
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Optimize Cash Flow</CardTitle>
              </div>
              <CardDescription>
                Track income, expenses, and emergency fund to understand 
                how much surplus you can allocate to wealth building
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Sign in with Google, GitHub, or Email
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login-secondary"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
