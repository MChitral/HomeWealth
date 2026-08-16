import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatementIngestDialog } from "../statement-ingest-dialog";
import { HomelineFacilityPanel } from "../homeline-facility-panel";
import { PrivilegeRoomPanel } from "../privilege-room-panel";
import { SmithCta } from "../smith-cta";
import { PaymentHistorySection } from "../payment-history-section";
import type { StatementFactsResponse, StatementPreview } from "../../api/mortgage-api";
import type { UiPayment } from "../../types";

vi.mock("../../api/mortgage-api", () => ({
  mortgageApi: {
    uploadStatement: vi.fn(),
    rejectStatement: vi.fn(),
    confirmStatement: vi.fn(),
  },
  mortgageQueryKeys: {
    mortgagePayments: (id: string | null) => ["/api/mortgages", id, "payments"],
    statementFacts: (id: string | null) => ["/api/mortgages", id, "statement-facts"],
    mortgages: () => ["/api/mortgages"],
  },
}));

import { mortgageApi } from "../../api/mortgage-api";

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const julyPreview: StatementPreview = {
  stagedId: "staged-1",
  mortgageId: "mortgage-1",
  documentType: "homeline_monthly",
  statementPeriod: "2026-07",
  status: "staged",
  facts: {
    documentType: "homeline_monthly",
    availableCredit: "9989.35",
    mortgageOutstanding: "282105.53",
    paymentsReceived: "2500.69",
  },
  suggestedPrivilege: { type: "double_up", pending: true },
  proofs: { canConfirm: true, reasons: [] },
  confirmEnabled: true,
  expiresAt: "2027-01-01T00:00:00.000Z",
};

const facts: StatementFactsResponse = {
  facility: {
    statementPeriod: "2026-07",
    mortgageOutstanding: "282105.53",
    helocDrawn: "0.00",
    availableCredit: "9989.35",
    planTotalLimit: "292094.88",
  },
  privilege: { lumpSumUsed: "0.00", doubleUpCount: 1, pendingExtra: false },
  projectionLock: null,
};

describe("statement ingest UI (U5)", () => {
  it("shows July facility numbers in preview before confirm", async () => {
    vi.mocked(mortgageApi.uploadStatement).mockResolvedValue(julyPreview);
    render(<StatementIngestDialog open mortgageId="mortgage-1" onOpenChange={() => undefined} />, {
      wrapper: wrapper(),
    });
    const file = new File(["%PDF-1.4"], "july.pdf", { type: "application/pdf" });
    await userEvent.upload(screen.getByTestId("input-statement-pdf"), file);
    expect(await screen.findByTestId("statement-preview")).toHaveTextContent("9989.35");
    expect(screen.getByTestId("button-confirm-statement")).toBeEnabled();
  });

  it("hides confirm when the preview cannot be applied", async () => {
    vi.mocked(mortgageApi.uploadStatement).mockResolvedValue({
      ...julyPreview,
      confirmEnabled: false,
      proofs: { canConfirm: false, reasons: ["unknown fingerprint"] },
    });
    render(<StatementIngestDialog open mortgageId="mortgage-1" onOpenChange={() => undefined} />, {
      wrapper: wrapper(),
    });
    const file = new File(["%PDF-1.4"], "unknown.pdf", { type: "application/pdf" });
    await userEvent.upload(screen.getByTestId("input-statement-pdf"), file);
    expect(await screen.findByTestId("confirm-blocked")).toBeInTheDocument();
    expect(screen.getByTestId("button-confirm-statement")).toBeDisabled();
  });

  it("shows observed facility and zero lump-sum after confirm facts load", () => {
    render(
      <>
        <HomelineFacilityPanel facts={facts} />
        <PrivilegeRoomPanel facts={facts} />
      </>
    );
    expect(screen.getByTestId("observed-available-credit")).toHaveTextContent("9,989.35");
    expect(screen.getByTestId("lump-sum-used")).toHaveTextContent("0.00");
    expect(screen.getByTestId("double-up-count")).toHaveTextContent("1");
  });

  it("hides the Smith CTA when the HELOC rate exceeds the mortgage rate", () => {
    render(
      <SmithCta helocEffectiveRate={4.95} mortgageEffectiveRate={3.55}>
        <button>Create Strategy</button>
      </SmithCta>
    );
    expect(screen.queryByText("Create Strategy")).not.toBeInTheDocument();
  });

  it("shows the Smith CTA when rates are unknown", () => {
    render(
      <SmithCta>
        <button>Create Strategy</button>
      </SmithCta>
    );
    expect(screen.getByText("Create Strategy")).toBeInTheDocument();
  });

  it("rejects a preview without confirming", async () => {
    vi.mocked(mortgageApi.uploadStatement).mockResolvedValue(julyPreview);
    vi.mocked(mortgageApi.rejectStatement).mockResolvedValue({ status: "rejected" });
    render(<StatementIngestDialog open mortgageId="mortgage-1" onOpenChange={() => undefined} />, {
      wrapper: wrapper(),
    });
    const file = new File(["%PDF-1.4"], "july.pdf", { type: "application/pdf" });
    await userEvent.upload(screen.getByTestId("input-statement-pdf"), file);
    await screen.findByTestId("statement-preview");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(mortgageApi.rejectStatement).toHaveBeenCalledWith("mortgage-1", "staged-1");
    expect(mortgageApi.confirmStatement).not.toHaveBeenCalled();
  });

  it("requires supersede after a same-period confirm conflict", async () => {
    vi.mocked(mortgageApi.uploadStatement).mockResolvedValue(julyPreview);
    vi.mocked(mortgageApi.confirmStatement).mockRejectedValueOnce(
      new Error("409: Re-upload requires explicit supersede")
    );
    render(<StatementIngestDialog open mortgageId="mortgage-1" onOpenChange={() => undefined} />, {
      wrapper: wrapper(),
    });
    const file = new File(["%PDF-1.4"], "july.pdf", { type: "application/pdf" });
    await userEvent.upload(screen.getByTestId("input-statement-pdf"), file);
    await screen.findByTestId("statement-preview");
    await userEvent.click(screen.getByTestId("button-confirm-statement"));
    expect(await screen.findByTestId("checkbox-supersede")).toBeChecked();
  });

  it("labels Double-Up extras on reconciled statement rows", () => {
    const payment: UiPayment = {
      id: "p1",
      date: "2026-07-02",
      year: 2026,
      regularPaymentAmount: 1500.69,
      prepaymentAmount: 1000,
      paymentAmount: 2500.69,
      effectiveRate: 3.55,
      principal: 1672.68,
      interest: 828.01,
      remainingBalance: 282105.53,
      mortgageType: "variable-fixed",
      triggerHit: false,
      amortizationYears: 22,
      remainingAmortizationMonths: 275,
      calculationSource: "statement",
      isSkipped: false,
      skippedInterestAccrued: 0,
    };
    render(
      <PaymentHistorySection
        filteredPayments={[payment]}
        availableYears={[2026]}
        filterYear="all"
        onFilterYearChange={() => undefined}
        filterDateRange={{ start: null, end: null }}
        onFilterDateRangeChange={() => undefined}
        filterPaymentType="all"
        onFilterPaymentTypeChange={() => undefined}
        searchAmount=""
        onSearchAmountChange={() => undefined}
        formatAmortization={(years) => `${years}y`}
        deletePaymentMutation={{ isPending: false, mutate: () => undefined } as never}
        currentTerm={null}
        currentEffectiveRate={3.55}
        doubleUpCount={1}
      />
    );
    expect(screen.getByText("Reconciled")).toBeInTheDocument();
    expect(screen.getByTestId("badge-double-up")).toHaveTextContent("Double-Up");
  });
});
