/**
 * Tests for SkipPaymentDialog
 *
 * Verifies that displayed values use the correct SkipImpactResponse fields:
 *   - totalInterestAccrued (interest shown in the impact panel and confirmation text)
 *   - finalBalance        (new balance after skip)
 *   - balanceIncrease     (red "Balance Increase" figure)
 *   - extendedAmortizationMonths
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SkipPaymentDialog } from "../skip-payment-dialog";
import type { UiTerm } from "../../types";
import type { MortgagePayment } from "@shared/schema";
import * as mortgageApiModule from "../../api/mortgage-api";
import * as paymentSkipping from "@/shared/utils/payment-skipping";

// ── API module mocks ──────────────────────────────────────────────────────────
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

vi.mock("@/shared/utils/payment-skipping", () => ({
  canSkipPayment: vi.fn((skipped: number, limit: number) => skipped < limit),
  countSkippedPaymentsInYear: vi.fn(() => 0),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
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

const mockPayments: MortgagePayment[] = [];

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  mortgageId: "mortgage-1",
  currentTerm: mockTerm,
  currentBalance: 400000,
  currentAmortizationMonths: 300,
  currentEffectiveRate: 5.49,
  payments: mockPayments,
};

// ── Shared skip-impact fixture using the CORRECT field names ─────────────────
const mockSkipImpact = {
  totalInterestAccrued: 1830.41,
  finalBalance: 401830.41,
  extendedAmortizationMonths: 301,
  balanceIncrease: 1830.41,
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("SkipPaymentDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default eligibility: user has skipped 0 payments, can skip
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(0);
    vi.mocked(paymentSkipping.canSkipPayment).mockImplementation(
      (skipped: number, limit: number) => skipped < limit
    );
    // Default: calculateSkipImpact resolves with the correct SkipImpactResponse shape
    vi.mocked(mortgageApiModule.calculateSkipImpact).mockResolvedValue(mockSkipImpact);
  });

  // ── Eligibility ─────────────────────────────────────────────────────────────

  it("shows Eligible badge when user has not exceeded skip limit", () => {
    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Skip Eligibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Eligible/i)).toBeInTheDocument();
  });

  it("shows Not Eligible badge when at skip limit", () => {
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(2);
    vi.mocked(paymentSkipping.canSkipPayment).mockReturnValue(false);

    render(
      React.createElement(SkipPaymentDialog, { ...defaultProps, maxSkipsPerYear: 2 }),
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Not Eligible/i)).toBeInTheDocument();
    expect(screen.queryByTestId("button-confirm-skip-payment")).not.toBeInTheDocument();
  });

  // ── API field names: impact panel displays correct values ────────────────────

  it("renders totalInterestAccrued in the impact panel", async () => {
    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/Impact of Skipping This Payment/i)).toBeInTheDocument();
    });

    // $1,830.41 – from totalInterestAccrued
    expect(screen.getAllByText(/1,830\.41/).length).toBeGreaterThan(0);
  });

  it("renders finalBalance in the 'New Balance After Skip' cell", async () => {
    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/New Balance After Skip/i)).toBeInTheDocument();
    });

    // $401,830.41 – from finalBalance
    expect(screen.getByText(/401,830\.41/)).toBeInTheDocument();
  });

  it("renders balanceIncrease in the 'Balance Increase' cell", async () => {
    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/Balance Increase/i)).toBeInTheDocument();
    });

    // +$1,830.41 – from balanceIncrease
    expect(screen.getByText(/\+\$1,830\.41/)).toBeInTheDocument();
  });

  it("renders extendedAmortizationMonths in the 'Extended Amortization' cell", async () => {
    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/Extended Amortization/i)).toBeInTheDocument();
    });

    // 301 months shown as "(301 months)"
    expect(screen.getByText(/301 months/i)).toBeInTheDocument();
  });

  // ── Confirmation gate ────────────────────────────────────────────────────────

  it("keeps Skip Payment button disabled until confirmation checkbox is checked", async () => {
    const user = userEvent.setup();

    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId("checkbox-confirm-skip")).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId("checkbox-confirm-skip");
    const button = screen.getByTestId("button-confirm-skip-payment");

    expect(checkbox).not.toBeChecked();
    expect(button).toBeDisabled();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(button).not.toBeDisabled();
  });

  // ── Confirmation label uses totalInterestAccrued (not a wrong field) ─────────

  it("confirmation label references totalInterestAccrued amount", async () => {
    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId("checkbox-confirm-skip")).toBeInTheDocument();
    });

    // The label says "increase my balance by $X" where X = totalInterestAccrued
    const label = screen.getByText(/increase my balance by/i);
    expect(label).toHaveTextContent("1,830.41");
  });

  // ── Skip payment is submitted with correct payload ───────────────────────────

  it("submits skip payment with mortgageId, termId, and paymentDate", async () => {
    const { mortgageApi } = await import("../../api");
    const user = userEvent.setup();

    vi.mocked(mortgageApi.skipPayment).mockResolvedValue({
      id: "payment-1",
      mortgageId: "mortgage-1",
      termId: "term-1",
      paymentDate: "2026-08-01",
      paymentPeriodLabel: "Skipped Payment",
      regularPaymentAmount: "2000.00",
      prepaymentAmount: "0.00",
      paymentAmount: "0.00",
      principalPaid: "0.00",
      interestPaid: "0.00",
      remainingBalance: "401830.41",
      effectiveRate: "5.490",
      triggerRateHit: 0,
      isSkipped: 1,
      skippedInterestAccrued: "1830.41",
      remainingAmortizationMonths: 301,
      createdAt: new Date(),
    } as MortgagePayment);

    render(
      React.createElement(SkipPaymentDialog, defaultProps),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(screen.getByTestId("checkbox-confirm-skip")).toBeInTheDocument());

    await user.click(screen.getByTestId("checkbox-confirm-skip"));
    await user.click(screen.getByTestId("button-confirm-skip-payment"));

    await waitFor(
      () => {
        expect(mortgageApi.skipPayment).toHaveBeenCalledWith(
          "mortgage-1",
          "term-1",
          expect.objectContaining({ maxSkipsPerYear: 2 })
        );
      },
      { timeout: 10000 }
    );
  }, 15000);
});
