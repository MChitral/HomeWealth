import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSkipPayment } from "../use-skip-payment";
import type { MortgagePayment } from "@shared/schema";
import { countSkippedPaymentsInYear, canSkipPayment } from "@server-shared/calculations/payment-skipping";

// Mock the API
vi.mock("../../api", () => ({
  mortgageApi: {
    skipPayment: vi.fn(),
  },
  mortgageQueryKeys: {
    mortgagePayments: (id: string | null) => ["/api/mortgages", id, "payments"],
    mortgages: () => ["/api/mortgages"],
  },
}));

// Mock toast
vi.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock calculation functions
vi.mock("@server-shared/calculations/payment-skipping", () => ({
  calculateSkippedPayment: vi.fn((balance, rate, frequency, amortization) => ({
    interestAccrued: balance * (rate / 12), // Simplified calculation
    newBalance: balance + balance * (rate / 12),
    extendedAmortizationMonths: amortization + 1,
  })),
  canSkipPayment: vi.fn((skipped, limit) => skipped < limit),
  countSkippedPaymentsInYear: vi.fn((payments, year) => {
    return payments.filter((p: MortgagePayment) => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getFullYear() === year && (p.isSkipped === 1 || p.isSkipped === true);
    }).length;
  }),
  calculateTotalSkippedInterest: vi.fn((payments) => {
    return payments.reduce((total: number, p: MortgagePayment) => {
      return total + Number(p.skippedInterestAccrued || 0);
    }, 0);
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useSkipPayment", () => {
  const mockPayments: MortgagePayment[] = [
    {
      id: "1",
      mortgageId: "mortgage-1",
      termId: "term-1",
      paymentDate: "2024-01-15",
      paymentPeriodLabel: "Jan-2024",
      regularPaymentAmount: "2000.00",
      prepaymentAmount: "0.00",
      paymentAmount: "2000.00",
      principalPaid: "500.00",
      interestPaid: "1500.00",
      remainingBalance: "395000.00",
      effectiveRate: "5.490",
      triggerRateHit: 0,
      isSkipped: 0,
      skippedInterestAccrued: "0.00",
      remainingAmortizationMonths: 300,
      createdAt: new Date(),
    },
    {
      id: "2",
      mortgageId: "mortgage-1",
      termId: "term-1",
      paymentDate: "2024-06-15",
      paymentPeriodLabel: "Jun-2024",
      regularPaymentAmount: "2000.00",
      prepaymentAmount: "0.00",
      paymentAmount: "0.00",
      principalPaid: "0.00",
      interestPaid: "0.00",
      remainingBalance: "400000.00",
      effectiveRate: "5.490",
      triggerRateHit: 0,
      isSkipped: 1,
      skippedInterestAccrued: "1830.00",
      remainingAmortizationMonths: 301,
      createdAt: new Date(),
    },
  ];

  const defaultProps = {
    mortgageId: "mortgage-1",
    termId: "term-1",
    currentBalance: 400000,
    currentAmortizationMonths: 300,
    effectiveRate: 0.0549,
    paymentFrequency: "monthly" as const,
    payments: mockPayments,
    maxSkipsPerYear: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate skip eligibility correctly", () => {
    const { result } = renderHook(() => useSkipPayment(defaultProps), {
      wrapper: createWrapper(),
    });

    expect(result.current.canSkip).toBe(true);
    expect(result.current.skippedThisYear).toBe(1);
    expect(result.current.skipLimit).toBe(2);
  });

  it("should show not eligible when at limit", () => {
    const paymentsAtLimit: MortgagePayment[] = [
      ...mockPayments,
      {
        id: "3",
        mortgageId: "mortgage-1",
        termId: "term-1",
        paymentDate: "2024-12-15",
        paymentPeriodLabel: "Dec-2024",
        regularPaymentAmount: "2000.00",
        prepaymentAmount: "0.00",
        paymentAmount: "0.00",
        principalPaid: "0.00",
        interestPaid: "0.00",
        remainingBalance: "401830.00",
        effectiveRate: "5.490",
        triggerRateHit: 0,
        isSkipped: 1,
        skippedInterestAccrued: "1830.00",
        remainingAmortizationMonths: 302,
        createdAt: new Date(),
      },
    ];

    const { result } = renderHook(
      () => useSkipPayment({ ...defaultProps, payments: paymentsAtLimit }),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.canSkip).toBe(false);
    expect(result.current.skippedThisYear).toBe(2);
  });

  it("should calculate skip impact when payment date is provided", () => {
    const { result } = renderHook(() => useSkipPayment(defaultProps), {
      wrapper: createWrapper(),
    });

    result.current.calculateSkipImpact("2024-07-15");

    expect(result.current.skipImpact).toBeTruthy();
    if (result.current.skipImpact) {
      expect(result.current.skipImpact.interestAccrued).toBeGreaterThan(0);
      expect(result.current.skipImpact.newBalance).toBeGreaterThan(defaultProps.currentBalance);
      expect(result.current.skipImpact.extendedAmortizationMonths).toBeGreaterThan(
        defaultProps.currentAmortizationMonths
      );
    }
  });

  it("should reset skip impact", () => {
    const { result } = renderHook(() => useSkipPayment(defaultProps), {
      wrapper: createWrapper(),
    });

    result.current.calculateSkipImpact("2024-07-15");
    expect(result.current.skipImpact).toBeTruthy();

    result.current.resetSkipImpact();
    expect(result.current.skipImpact).toBeNull();
  });

  it("should handle skip payment mutation", async () => {
    const { mortgageApi } = await import("../../api");
    vi.mocked(mortgageApi.skipPayment).mockResolvedValue({
      id: "new-payment",
      mortgageId: "mortgage-1",
      termId: "term-1",
      paymentDate: "2024-07-15",
      paymentPeriodLabel: "Jul-2024",
      regularPaymentAmount: "0.00",
      prepaymentAmount: "0.00",
      paymentAmount: "0.00",
      principalPaid: "0.00",
      interestPaid: "0.00",
      remainingBalance: "401830.00",
      effectiveRate: "5.490",
      triggerRateHit: 0,
      isSkipped: 1,
      skippedInterestAccrued: "1830.00",
      remainingAmortizationMonths: 301,
      createdAt: new Date(),
    } as MortgagePayment);

    const { result } = renderHook(() => useSkipPayment(defaultProps), {
      wrapper: createWrapper(),
    });

    result.current.skipPaymentMutation.mutate({
      paymentDate: "2024-07-15",
      maxSkipsPerYear: 2,
    });

    await waitFor(() => {
      expect(result.current.skipPaymentMutation.isSuccess).toBe(true);
    });

    expect(mortgageApi.skipPayment).toHaveBeenCalledWith(
      "mortgage-1",
      "term-1",
      {
        paymentDate: "2024-07-15",
        maxSkipsPerYear: 2,
      }
    );
  });

  it("should handle skip payment mutation error", async () => {
    const { mortgageApi } = await import("../../api");
    vi.mocked(mortgageApi.skipPayment).mockRejectedValue(new Error("Skip limit reached"));

    const { result } = renderHook(() => useSkipPayment(defaultProps), {
      wrapper: createWrapper(),
    });

    result.current.skipPaymentMutation.mutate({
      paymentDate: "2024-07-15",
      maxSkipsPerYear: 2,
    });

    await waitFor(() => {
      expect(result.current.skipPaymentMutation.isError).toBe(true);
    });
  });
});

