import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SkipPaymentDialog } from "../skip-payment-dialog";
import type { UiTerm } from "../../types";
import type { MortgagePayment } from "@shared/schema";
import { mortgageApi } from "../../api";
import * as mortgageApiModule from "../../api/mortgage-api";
import * as paymentSkipping from "@/shared/utils/payment-skipping";

// ── API mocks ─────────────────────────────────────────────────────────────────
vi.mock("../../api", () => ({
  mortgageApi: {
    skipPayment: vi.fn(),
  },
  mortgageQueryKeys: {
    mortgagePayments: (id: string | null) => ["/api/mortgages", id, "payments"],
    mortgages: () => ["/api/mortgages"],
  },
}));

vi.mock("../../api/mortgage-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/mortgage-api")>();
  return {
    ...actual,
    calculateSkipImpact: vi.fn(),
  };
});

vi.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Correct path: @/shared/utils/payment-skipping (NOT @/shared/calculations/payment-skipping)
vi.mock("@/shared/utils/payment-skipping", () => ({
  canSkipPayment: vi.fn((skipped: number, limit: number) => skipped < limit),
  countSkippedPaymentsInYear: vi.fn(() => 0),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

const mockTerm: UiTerm = {
  id: "term-1",
  mortgageId: "mortgage-1",
  termType: "fixed",
  startDate: "2024-01-01",
  endDate: "2029-01-01",
  termYears: 5,
  lockedSpread: 0,
  fixedRate: 5.49,
  primeRate: null,
  paymentFrequency: "monthly",
  regularPaymentAmount: 2000,
};

const mockSkipImpact = {
  totalInterestAccrued: 1830.0,
  finalBalance: 401830.0,
  extendedAmortizationMonths: 301,
  balanceIncrease: 1830.0,
};

describe("SkipPaymentDialog Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore eligibility mocks so each test starts with user being eligible
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(0);
    vi.mocked(paymentSkipping.canSkipPayment).mockImplementation(
      (skipped: number, limit: number) => skipped < limit
    );
    vi.mocked(mortgageApiModule.calculateSkipImpact).mockResolvedValue(mockSkipImpact);
  });

  it("should display skip eligibility when eligible", () => {
    render(
      React.createElement(SkipPaymentDialog, {
        open: true,
        onOpenChange: vi.fn(),
        mortgageId: "mortgage-1",
        currentTerm: mockTerm,
        currentBalance: 400000,
        currentAmortizationMonths: 300,
        currentEffectiveRate: 5.49,
        payments: [],
      }),
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Skip Eligibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Eligible/i)).toBeInTheDocument();
  });

  it("should calculate and display impact when dialog opens", async () => {
    render(
      React.createElement(SkipPaymentDialog, {
        open: true,
        onOpenChange: vi.fn(),
        mortgageId: "mortgage-1",
        currentTerm: mockTerm,
        currentBalance: 400000,
        currentAmortizationMonths: 300,
        currentEffectiveRate: 5.49,
        payments: [],
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/Impact of Skipping This Payment/i)).toBeInTheDocument();
    });

    // totalInterestAccrued is shown as the interest figure
    expect(screen.getAllByText(/1,830\.00/).length).toBeGreaterThan(0);
  });

  it("should require confirmation before skipping", async () => {
    const user = userEvent.setup();
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

    render(
      React.createElement(SkipPaymentDialog, {
        open: true,
        onOpenChange: vi.fn(),
        mortgageId: "mortgage-1",
        currentTerm: mockTerm,
        currentBalance: 400000,
        currentAmortizationMonths: 300,
        currentEffectiveRate: 5.49,
        payments: [],
      }),
      { wrapper: createWrapper() }
    );

    // Wait for the impact to load so the checkbox appears
    await waitFor(() => {
      expect(screen.getByText(/Impact of Skipping This Payment/i)).toBeInTheDocument();
    });

    const confirmCheckbox = screen.getByTestId("checkbox-confirm-skip");
    const skipButton = screen.getByTestId("button-confirm-skip-payment");

    expect(confirmCheckbox).not.toBeChecked();
    expect(skipButton).toBeDisabled();

    await user.click(confirmCheckbox);
    expect(confirmCheckbox).toBeChecked();
    expect(skipButton).not.toBeDisabled();

    await user.click(skipButton);

    await waitFor(
      () => {
        expect(mortgageApi.skipPayment).toHaveBeenCalledWith("mortgage-1", "term-1", {
          paymentDate: expect.any(String),
          maxSkipsPerYear: 2,
        });
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("should show not eligible when at skip limit", () => {
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(2);
    vi.mocked(paymentSkipping.canSkipPayment).mockReturnValue(false);

    render(
      React.createElement(SkipPaymentDialog, {
        open: true,
        onOpenChange: vi.fn(),
        mortgageId: "mortgage-1",
        currentTerm: mockTerm,
        currentBalance: 400000,
        currentAmortizationMonths: 300,
        currentEffectiveRate: 5.49,
        payments: [],
        maxSkipsPerYear: 2,
      }),
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Not Eligible/i)).toBeInTheDocument();
    expect(screen.getByText(/limit.*reached/i)).toBeInTheDocument();
  });
});
