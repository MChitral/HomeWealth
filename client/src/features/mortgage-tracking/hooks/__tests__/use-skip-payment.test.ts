/**
 * Unit tests for useSkipPayment hook
 *
 * Tests eligibility checks (canSkip, skippedThisYear, skipLimit) and
 * impact calculation via the calculateSkipImpact API call.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useSkipPayment } from "../use-skip-payment";
import type { MortgagePayment } from "@shared/schema";
// Import the mocked modules so we can control them per-test
import * as paymentSkipping from "@/shared/utils/payment-skipping";
import * as mortgageApiModule from "../../api/mortgage-api";

// ── Module mocks ──────────────────────────────────────────────────────────────
// vi.mock calls are hoisted to the top; factories must NOT reference outer consts.
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
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

const baseProps = {
  mortgageId: "mortgage-1",
  termId: "term-1",
  currentBalance: 400000,
  currentAmortizationMonths: 300,
  effectiveRate: 0.0549,
  paymentFrequency: "monthly" as const,
  payments: [] as MortgagePayment[],
  maxSkipsPerYear: 2,
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("useSkipPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore sensible defaults after each clear
    vi.mocked(paymentSkipping.canSkipPayment).mockImplementation(
      (skipped: number, limit: number) => skipped < limit
    );
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(0);
  });

  // ── Eligibility: canSkip ────────────────────────────────────────────────────

  it("returns canSkip=true when skipped payments are below the limit", () => {
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(1);
    vi.mocked(paymentSkipping.canSkipPayment).mockReturnValue(true);

    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    expect(result.current.canSkip).toBe(true);
  });

  it("returns canSkip=false when the skip limit has been reached", () => {
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(2);
    vi.mocked(paymentSkipping.canSkipPayment).mockReturnValue(false);

    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    expect(result.current.canSkip).toBe(false);
  });

  // ── Eligibility: skippedThisYear & skipLimit ─────────────────────────────────

  it("exposes the correct skippedThisYear count", () => {
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(1);

    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    expect(result.current.skippedThisYear).toBe(1);
  });

  it("exposes skipLimit equal to maxSkipsPerYear", () => {
    const { result } = renderHook(() => useSkipPayment({ ...baseProps, maxSkipsPerYear: 3 }), {
      wrapper: createWrapper(),
    });

    expect(result.current.skipLimit).toBe(3);
  });

  it("defaults skipLimit to 2 when maxSkipsPerYear is not provided", () => {
    const {
      mortgageId,
      termId,
      currentBalance,
      currentAmortizationMonths,
      effectiveRate,
      paymentFrequency,
      payments,
    } = baseProps;
    const { result } = renderHook(
      () =>
        useSkipPayment({
          mortgageId,
          termId,
          currentBalance,
          currentAmortizationMonths,
          effectiveRate,
          paymentFrequency,
          payments,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.skipLimit).toBe(2);
  });

  // ── Initial state ────────────────────────────────────────────────────────────

  it("starts with skipImpact as null before any calculation", () => {
    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    expect(result.current.skipImpact).toBeNull();
  });

  // ── Impact calculation ────────────────────────────────────────────────────────

  it("populates skipImpact with SkipImpactResponse fields after calculateSkipImpact is called", async () => {
    const impactData = {
      totalInterestAccrued: 1830.41,
      finalBalance: 401830.41,
      extendedAmortizationMonths: 301,
      balanceIncrease: 1830.41,
    };
    vi.mocked(mortgageApiModule.calculateSkipImpact).mockResolvedValue(impactData);

    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.calculateSkipImpact("2026-08-01");
    });

    await waitFor(() => {
      expect(result.current.skipImpact).not.toBeNull();
    });

    expect(result.current.skipImpact).toEqual(impactData);
  });

  it("calls calculateSkipImpact API with the correct mortgage parameters", async () => {
    vi.mocked(mortgageApiModule.calculateSkipImpact).mockResolvedValue({
      totalInterestAccrued: 1830.41,
      finalBalance: 401830.41,
      extendedAmortizationMonths: 301,
      balanceIncrease: 1830.41,
    });

    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.calculateSkipImpact("2026-08-01");
    });

    await waitFor(() => {
      expect(mortgageApiModule.calculateSkipImpact).toHaveBeenCalledWith({
        currentBalance: 400000,
        annualRate: 0.0549,
        paymentFrequency: "monthly",
        currentAmortizationMonths: 300,
        numberOfSkips: 1,
      });
    });
  });

  it("clears skipImpact to null when resetSkipImpact is called", async () => {
    vi.mocked(mortgageApiModule.calculateSkipImpact).mockResolvedValue({
      totalInterestAccrued: 1830.41,
      finalBalance: 401830.41,
      extendedAmortizationMonths: 301,
      balanceIncrease: 1830.41,
    });

    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.calculateSkipImpact("2026-08-01");
    });

    await waitFor(() => expect(result.current.skipImpact).not.toBeNull());

    act(() => {
      result.current.resetSkipImpact();
    });

    expect(result.current.skipImpact).toBeNull();
  });

  it("sets skipImpact to null when the API call fails", async () => {
    vi.mocked(mortgageApiModule.calculateSkipImpact).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useSkipPayment(baseProps), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.calculateSkipImpact("2026-08-01");
    });

    await waitFor(() => {
      // After a failed call, skipImpact stays null (onError handler sets it to null)
      expect(result.current.skipImpact).toBeNull();
    });
  });

  // ── countSkippedPaymentsInYear is called with current year ────────────────────

  it("passes the current year to countSkippedPaymentsInYear", () => {
    vi.mocked(paymentSkipping.countSkippedPaymentsInYear).mockReturnValue(0);

    renderHook(() => useSkipPayment(baseProps), { wrapper: createWrapper() });

    expect(paymentSkipping.countSkippedPaymentsInYear).toHaveBeenCalledWith(
      baseProps.payments,
      new Date().getFullYear()
    );
  });
});
