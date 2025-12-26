import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SkipPaymentDialog } from "../skip-payment-dialog";
import type { UiTerm } from "../../types";
import type { MortgagePayment } from "@shared/schema";
import { mortgageApi } from "../../api";

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
  calculateSkippedPayment: vi.fn((_balance, _rate, _frequency, _amortization) => ({
    interestAccrued: 1830.0,
    newBalance: 401830.0,
    extendedAmortizationMonths: 301,
  })),
  canSkipPayment: vi.fn((skipped, limit) => skipped < limit),
  countSkippedPaymentsInYear: vi.fn(() => 0),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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

describe("SkipPaymentDialog Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display skip eligibility when eligible", () => {
    render(
      <SkipPaymentDialog
        open={true}
        onOpenChange={vi.fn()}
        mortgageId="mortgage-1"
        currentTerm={mockTerm}
        currentBalance={400000}
        currentAmortizationMonths={300}
        currentEffectiveRate={5.49}
        payments={mockPayments}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Skip Eligibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Eligible/i)).toBeInTheDocument();
  });

  it("should calculate and display impact when date is selected", async () => {
    const user = userEvent.setup();
    render(
      <SkipPaymentDialog
        open={true}
        onOpenChange={vi.fn()}
        mortgageId="mortgage-1"
        currentTerm={mockTerm}
        currentBalance={400000}
        currentAmortizationMonths={300}
        currentEffectiveRate={5.49}
        payments={mockPayments}
      />,
      { wrapper: createWrapper() }
    );

    const dateInput = screen.getByLabelText(/Payment Date to Skip/i);
    await user.type(dateInput, "2024-07-15");

    await waitFor(() => {
      expect(screen.getByText(/Impact of Skipping This Payment/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1,830/)).toBeInTheDocument();
    });
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
      <SkipPaymentDialog
        open={true}
        onOpenChange={vi.fn()}
        mortgageId="mortgage-1"
        currentTerm={mockTerm}
        currentBalance={400000}
        currentAmortizationMonths={300}
        currentEffectiveRate={5.49}
        payments={mockPayments}
      />,
      { wrapper: createWrapper() }
    );

    const dateInput = screen.getByLabelText(/Payment Date to Skip/i);
    await user.type(dateInput, "2024-07-15");

    await waitFor(() => {
      expect(screen.getByText(/Impact of Skipping This Payment/i)).toBeInTheDocument();
    });

    // Confirm checkbox should be required
    const confirmCheckbox = screen.getByTestId("checkbox-confirm-skip");
    const skipButton = screen.getByTestId("button-confirm-skip-payment");

    expect(confirmCheckbox).not.toBeChecked();
    expect(skipButton).toBeDisabled();

    await user.click(confirmCheckbox);
    expect(confirmCheckbox).toBeChecked();
    expect(skipButton).not.toBeDisabled();

    await user.click(skipButton);

    await waitFor(() => {
      expect(mortgageApi.skipPayment).toHaveBeenCalledWith("mortgage-1", "term-1", {
        paymentDate: "2024-07-15",
        maxSkipsPerYear: 2,
      });
    });
  });

  it("should show not eligible when at skip limit", () => {
    const paymentsAtLimit: MortgagePayment[] = [
      {
        id: "1",
        mortgageId: "mortgage-1",
        termId: "term-1",
        paymentDate: "2024-06-15",
        paymentPeriodLabel: "Jun-2024",
        regularPaymentAmount: "0.00",
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
      {
        id: "2",
        mortgageId: "mortgage-1",
        termId: "term-1",
        paymentDate: "2024-12-15",
        paymentPeriodLabel: "Dec-2024",
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
        remainingAmortizationMonths: 302,
        createdAt: new Date(),
      },
    ];

    // Mock countSkippedPaymentsInYear to return 2
    vi.doMock("@server-shared/calculations/payment-skipping", () => ({
      calculateSkippedPayment: vi.fn(),
      canSkipPayment: vi.fn(() => false),
      countSkippedPaymentsInYear: vi.fn(() => 2),
    }));

    render(
      <SkipPaymentDialog
        open={true}
        onOpenChange={vi.fn()}
        mortgageId="mortgage-1"
        currentTerm={mockTerm}
        currentBalance={400000}
        currentAmortizationMonths={300}
        currentEffectiveRate={5.49}
        payments={paymentsAtLimit}
        maxSkipsPerYear={2}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Not Eligible/i)).toBeInTheDocument();
    expect(screen.getByText(/limit.*reached/i)).toBeInTheDocument();
  });
});
