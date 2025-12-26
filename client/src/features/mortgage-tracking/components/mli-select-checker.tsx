import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";

interface MLISelectCheckerProps {
  onDiscountSelected?: (discount: 0 | 10 | 20 | 30) => void;
}

/**
 * MLI Select Discount Eligibility Checker
 * Guides users through eligibility questions to determine applicable discount
 */
export function MLISelectChecker({ onDiscountSelected }: MLISelectCheckerProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [discount, setDiscount] = useState<0 | 10 | 20 | 30 | null>(null);

  const questions = [
    {
      id: "propertyType",
      question: "What type of property is this?",
      options: [
        { value: "standard", label: "Standard Residential Property", discount: 10 },
        {
          value: "energyEfficient",
          label: "Energy-Efficient Home (ENERGY STAR certified)",
          discount: 20,
        },
        { value: "affordable", label: "Affordable Housing Program", discount: 30 },
        { value: "other", label: "Other", discount: 0 },
      ],
    },
    {
      id: "location",
      question: "Is the property located in a designated area?",
      options: [
        {
          value: "yes",
          label: "Yes (certain locations qualify for additional discounts)",
          discount: 20,
        },
        { value: "no", label: "No", discount: 0 },
      ],
    },
    {
      id: "borrowerProfile",
      question: "Do you qualify for any special borrower programs?",
      options: [
        { value: "yes", label: "Yes (first-time homebuyer, etc.)", discount: 10 },
        { value: "no", label: "No", discount: 0 },
      ],
    },
  ];

  const handleAnswer = (questionId: string, value: string, _questionDiscount: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Calculate discount based on answers
    // Take the highest applicable discount
    let maxDiscount = 0;
    for (const [key, answer] of Object.entries(newAnswers)) {
      const question = questions.find((q) => q.id === key);
      if (question) {
        const option = question.options.find((opt) => opt.value === answer);
        if (option && option.discount > maxDiscount) {
          maxDiscount = option.discount;
        }
      }
    }

    // Cap at 30% (maximum discount)
    const finalDiscount = Math.min(maxDiscount, 30) as 0 | 10 | 20 | 30;
    setDiscount(finalDiscount);

    if (onDiscountSelected) {
      onDiscountSelected(finalDiscount);
    }

    // Move to next question or finish
    if (step < questions.length) {
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setDiscount(null);
    if (onDiscountSelected) {
      onDiscountSelected(0);
    }
  };

  const currentQuestion = questions[step - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-indigo-500" />
          MLI Select Discount Eligibility
        </CardTitle>
        <CardDescription>
          Answer a few questions to determine if you qualify for MLI Select premium discounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {discount !== null && step > questions.length ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Eligibility Result:</strong> Based on your answers, you may be eligible for
                a <strong>{discount}% discount</strong> on your mortgage default insurance premium.
              </AlertDescription>
            </Alert>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                Your Estimated Discount
              </p>
              <p className="text-2xl font-bold text-green-600">{discount}%</p>
              <p className="text-xs text-muted-foreground mt-2">
                Note: This is an estimate. Final eligibility and discount amount will be determined
                by your lender and insurance provider based on official program criteria.
              </p>
            </div>
            <Button onClick={reset} variant="outline" className="w-full">
              Start Over
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentQuestion && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Question {step} of {questions.length}
                  </span>
                  <Badge variant="outline">
                    {discount !== null && discount > 0
                      ? `${discount}% discount`
                      : "No discount yet"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    {currentQuestion.question}
                  </Label>
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={(value) => {
                      const option = currentQuestion.options.find((opt) => opt.value === value);
                      if (option) {
                        handleAnswer(currentQuestion.id, value, option.discount);
                      }
                    }}
                  >
                    {currentQuestion.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer font-normal">
                          {option.label}
                          {option.discount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {option.discount}% discount
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}
          </div>
        )}

        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Important:</strong> MLI Select eligibility criteria may change over time. Always
            verify current eligibility requirements with your lender and insurance provider. This
            tool provides estimates only.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
