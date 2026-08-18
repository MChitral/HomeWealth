import { sql } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { MortgageService } from "./mortgage.service";
import type { MortgageTermService } from "./mortgage-term.service";
import type { StagedImportsRepository } from "@infrastructure/repositories/staged-imports.repository";
import type { MortgagePaymentsRepository } from "@infrastructure/repositories/mortgage-payments.repository";
import type { MortgagesRepository } from "@infrastructure/repositories/mortgages.repository";
import type { FacilitySnapshotsRepository } from "@infrastructure/repositories/facility-snapshots.repository";
import type { PrivilegeEventsRepository } from "@infrastructure/repositories/privilege-events.repository";
import type { LenderProjectionLocksRepository } from "@infrastructure/repositories/lender-projection-locks.repository";
import { IngestRequestError } from "./statement-ingest.service";
import {
  deriveHomelineSplit,
  proveOpeningBalance,
  proveStatementPayment,
  toCents,
} from "@server-shared/calculations/statement-proofs";
import type {
  CostOfBorrowingFacts,
  HomelineMonthlyFacts,
  StatementFacts,
} from "@shared/statement-facts";
import type { StagedImport } from "@shared/schema";

type ApplyDb = typeof db;

export type StatementFactsDto = {
  facility: {
    statementPeriod: string;
    mortgageOutstanding: string;
    helocDrawn: string;
    availableCredit: string;
    planTotalLimit: string | null;
  } | null;
  privilege: {
    lumpSumUsed: string;
    doubleUpCount: number;
    pendingExtra: boolean;
  };
  projectionLock: {
    statementPeriod: string;
    interestToEndOfTerm: string;
    triggeringAnnualRate: string | null;
    nextDueDate: string | null;
  } | null;
};

export class StatementApplyService {
  constructor(
    private readonly mortgages: MortgageService,
    private readonly terms: MortgageTermService,
    private readonly mortgageRows: MortgagesRepository,
    private readonly payments: MortgagePaymentsRepository,
    private readonly stagedImports: StagedImportsRepository,
    private readonly facilities: FacilitySnapshotsRepository,
    private readonly privileges: PrivilegeEventsRepository,
    private readonly locks: LenderProjectionLocksRepository,
    private readonly runLocked: (
      mortgageId: string,
      work: (tx?: ApplyDb) => Promise<void>
    ) => Promise<void> = runWithMortgageLock
  ) {}

  async confirm(input: {
    userId: string;
    mortgageId: string;
    stagedId: string;
    supersede?: boolean;
    treatAsDoubleUp?: boolean;
    overrideOpeningBalance?: boolean;
  }): Promise<{ paymentId?: string; status: "confirmed" }> {
    const mortgage = await this.mortgages.getByIdForUser(input.mortgageId, input.userId);
    if (!mortgage) {
      throw new IngestRequestError(404, "Mortgage not found");
    }

    let paymentId: string | undefined;
    await this.runLocked(input.mortgageId, async (tx) => {
      const staged = await this.stagedImports.findById(input.stagedId, tx);
      if (!staged || staged.mortgageId !== input.mortgageId || staged.userId !== input.userId) {
        throw new IngestRequestError(404, "Staged import not found");
      }
      if (staged.expiresAt <= new Date()) {
        throw new IngestRequestError(410, "Staged import has expired");
      }
      if (staged.status !== "staged") {
        throw new IngestRequestError(409, "Staged import is no longer pending");
      }
      if (staged.documentType === "annual_statement") {
        throw new IngestRequestError(409, "Annual confirm apply ships in a later slice");
      }

      const confirmed = await this.stagedImports.findActiveByKey(
        {
          userId: input.userId,
          mortgageId: input.mortgageId,
          documentType: staged.documentType,
          statementPeriod: staged.statementPeriod,
          status: "confirmed",
        },
        tx
      );
      if (confirmed && !input.supersede) {
        throw new IngestRequestError(409, "Re-upload requires explicit supersede");
      }

      const facts = staged.facts as StatementFacts;
      if (facts.documentType === "homeline_monthly") {
        paymentId = await this.applyHomeline({
          staged,
          facts,
          treatAsDoubleUp: Boolean(input.treatAsDoubleUp),
          overrideOpeningBalance: Boolean(input.overrideOpeningBalance),
          priorImport: confirmed,
          tx,
        });
      } else if (facts.documentType === "cost_of_borrowing") {
        await this.applyDisclosure({ staged, facts, priorImport: confirmed, tx });
      }

      await this.stagedImports.update(
        staged.id,
        {
          status: "confirmed",
          confirmedAt: new Date(),
          paymentId,
        },
        tx
      );
      if (confirmed) {
        await this.stagedImports.update(
          confirmed.id,
          {
            status: "superseded",
            supersededById: staged.id,
          },
          tx
        );
      }
    });

    return { paymentId, status: "confirmed" };
  }

  async getStatementFacts(mortgageId: string, userId: string): Promise<StatementFactsDto> {
    const mortgage = await this.mortgages.getByIdForUser(mortgageId, userId);
    if (!mortgage) {
      throw new IngestRequestError(404, "Mortgage not found");
    }
    const facility = await this.facilities.findLatestActive(mortgageId);
    const events = await this.privileges.findByMortgageId(mortgageId);
    const lock = await this.locks.findLatest(mortgageId);
    const payments = await this.payments.findByMortgageId(mortgageId);
    const lumpSumUsed = events
      .filter((event) => event.consumesLumpSumLimit === 1)
      .reduce((sum, event) => sum + toCents(event.amount), 0);
    const latestPayment = payments.at(-1);

    return {
      facility: facility
        ? {
            statementPeriod: facility.statementPeriod,
            mortgageOutstanding: facility.mortgageOutstanding,
            helocDrawn: facility.helocDrawn,
            availableCredit: facility.availableCredit,
            planTotalLimit: facility.planTotalLimit,
          }
        : null,
      privilege: {
        lumpSumUsed: (lumpSumUsed / 100).toFixed(2),
        doubleUpCount: events.filter((event) => event.privilegeType === "double_up").length,
        pendingExtra: Boolean(
          latestPayment &&
            Number(latestPayment.prepaymentAmount) > 0 &&
            !events.some((event) => event.paymentId === latestPayment.id)
        ),
      },
      projectionLock: lock
        ? {
            statementPeriod: lock.statementPeriod,
            interestToEndOfTerm: lock.interestToEndOfTerm,
            triggeringAnnualRate: lock.triggeringAnnualRate,
            nextDueDate: lock.nextDueDate,
          }
        : null,
    };
  }

  private async applyHomeline(input: {
    staged: StagedImport;
    facts: HomelineMonthlyFacts;
    treatAsDoubleUp: boolean;
    overrideOpeningBalance: boolean;
    priorImport?: StagedImport;
    tx?: ApplyDb;
  }): Promise<string> {
    const terms = await this.terms.listForMortgage(input.staged.mortgageId, input.staged.userId);
    const term = terms?.[0];
    if (!term) {
      throw new IngestRequestError(422, "Mortgage term is required before statement apply");
    }

    const payments = await this.payments.findByMortgageId(input.staged.mortgageId, input.tx);
    const samePeriod = payments.find(
      (payment) => payment.statementPeriod === input.facts.statementPeriod
    );
    const priorConfirmedClosing = payments
      .filter(
        (payment) =>
          payment.calculationSource === "statement" &&
          payment.statementPeriod &&
          payment.statementPeriod < input.facts.statementPeriod
      )
      .at(-1)?.remainingBalance;
    const priorAny = payments
      .filter((payment) => payment.paymentDate < (input.facts.paymentDate ?? `${input.facts.statementPeriod}-02`))
      .at(-1)?.remainingBalance;
    const chainHead =
      priorConfirmedClosing ??
      priorAny ??
      input.facts.openingBalance ??
      (await this.mortgages.getByIdForUser(input.staged.mortgageId, input.staged.userId))
        ?.currentBalance;
    if (!chainHead) {
      throw new IngestRequestError(422, "Opening balance is required for the first Homeline confirm");
    }

    if (priorConfirmedClosing) {
      const opening = proveOpeningBalance({
        expectedOpening: priorConfirmedClosing,
        actualOpening: input.facts.openingBalance ?? chainHead,
        override: input.overrideOpeningBalance,
      });
      if (!opening.ok) {
        throw new IngestRequestError(422, opening.reasons.join("; "));
      }
    }

    const split = deriveHomelineSplit({
      priorRemaining: chainHead,
      remainingBalance: input.facts.mortgageOutstanding,
      paymentAmount: input.facts.paymentsReceived,
      regularPaymentAmount: term.regularPaymentAmount,
    });
    const proof = proveStatementPayment({
      paymentAmount: input.facts.paymentsReceived,
      remainingBalance: input.facts.mortgageOutstanding,
      priorRemaining: chainHead,
      ...split,
    });
    if (!proof.ok) {
      throw new IngestRequestError(422, proof.reasons.join("; "));
    }

    const payload = {
      mortgageId: input.staged.mortgageId,
      termId: term.id,
      paymentDate: input.facts.paymentDate ?? `${input.facts.statementPeriod}-02`,
      paymentPeriodLabel: input.facts.statementPeriod,
      regularPaymentAmount: split.regularPaymentAmount,
      prepaymentAmount: split.prepaymentAmount,
      paymentAmount: input.facts.paymentsReceived,
      principalPaid: split.principalPaid,
      interestPaid: split.interestPaid,
      remainingBalance: input.facts.mortgageOutstanding,
      primeRate: term.primeRate,
      effectiveRate: term.fixedRate ?? "3.550",
      remainingAmortizationMonths: Math.max(
        1,
        (samePeriod?.remainingAmortizationMonths ??
          payments.at(-1)?.remainingAmortizationMonths ??
          300) - (samePeriod ? 0 : 1)
      ),
      calculationSource: "statement" as const,
      isMissed: split.isMissed,
      isSkipped: 0,
      skippedInterestAccrued: "0.00",
      statementPeriod: input.facts.statementPeriod,
    };

    const saved = samePeriod
      ? await this.payments.update(samePeriod.id, payload, input.tx)
      : await this.payments.create(payload, input.tx);
    if (!saved) {
      throw new IngestRequestError(500, "Failed to write statement payment");
    }

    if (input.priorImport) {
      await this.facilities.retractByStagedImportId(input.priorImport.id, input.tx);
      await this.privileges.deleteByStagedImportId(input.priorImport.id, input.tx);
    }
    await this.facilities.retractActiveByPeriod(
      input.staged.mortgageId,
      input.facts.statementPeriod,
      input.tx
    );

    await this.facilities.create(
      {
        mortgageId: input.staged.mortgageId,
        stagedImportId: input.staged.id,
        statementPeriod: input.facts.statementPeriod,
        statementAsOf: input.facts.statementAsOf,
        mortgageOutstanding: input.facts.mortgageOutstanding,
        helocDrawn: input.facts.helocDrawn,
        availableCredit: input.facts.availableCredit,
        helocLimit: input.facts.helocLimit,
        planTotalLimit: input.facts.planTotalLimit,
        status: "active",
      },
      input.tx
    );

    if (input.treatAsDoubleUp && Number(split.prepaymentAmount) > 0) {
      await this.privileges.create(
        {
          mortgageId: input.staged.mortgageId,
          stagedImportId: input.staged.id,
          paymentId: saved.id,
          privilegeType: "double_up",
          eventDate: saved.paymentDate,
          amount: split.prepaymentAmount,
          consumesLumpSumLimit: 0,
        },
        input.tx
      );
    }

    await this.mortgageRows.update(
      input.staged.mortgageId,
      {
        currentBalance: (await this.payments.findByMortgageId(input.staged.mortgageId, input.tx)).at(
          -1
        )?.remainingBalance ?? input.facts.mortgageOutstanding,
      },
      input.tx
    );

    if (toCents(saved.remainingBalance) !== toCents(input.facts.mortgageOutstanding)) {
      throw new IngestRequestError(422, "Post-apply balance proof failed");
    }

    return saved.id;
  }

  private async applyDisclosure(input: {
    staged: StagedImport;
    facts: CostOfBorrowingFacts;
    priorImport?: StagedImport;
    tx?: ApplyDb;
  }): Promise<void> {
    const payments = await this.payments.findByMortgageId(input.staged.mortgageId, input.tx);
    const matching = payments.find(
      (payment) =>
        payment.statementPeriod === input.facts.statementPeriod ||
        payment.paymentDate.startsWith(input.facts.statementPeriod)
    );
    if (!matching) {
      throw new IngestRequestError(422, "Disclosure confirm needs a Homeline payment for that period");
    }

    if (input.priorImport) {
      await this.privileges.deleteByStagedImportId(input.priorImport.id, input.tx);
      await this.locks.deleteByStagedImportId(input.priorImport.id, input.tx);
    }

    await this.locks.create(
      {
        mortgageId: input.staged.mortgageId,
        stagedImportId: input.staged.id,
        statementPeriod: input.facts.statementPeriod,
        interestToEndOfTerm: input.facts.interestToEndOfTerm,
        principalAndInterestToEndOfTerm: input.facts.principalAndInterestToEndOfTerm,
        triggeringAnnualRate: input.facts.triggeringAnnualRate,
        nextDueDate: input.facts.nextDueDate,
        rateReduction: input.facts.rateReduction,
        remainingTerm: input.facts.remainingTerm,
        remainingAmortization: input.facts.remainingAmortization,
      },
      input.tx
    );

    if (input.facts.isDoubleUpChange && Number(matching.prepaymentAmount) > 0) {
      await this.privileges.create(
        {
          mortgageId: input.staged.mortgageId,
          stagedImportId: input.staged.id,
          paymentId: matching.id,
          privilegeType: "double_up",
          eventDate: matching.paymentDate,
          amount: matching.prepaymentAmount,
          consumesLumpSumLimit: 0,
        },
        input.tx
      );
    }
  }
}

export async function runWithMortgageLock(
  mortgageId: string,
  work: (tx?: ApplyDb) => Promise<void>
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${mortgageId}))`);
    await work(tx as ApplyDb);
  });
}

export function previewProofs(input: {
  facts: HomelineMonthlyFacts;
  priorRemaining: string;
  regularPaymentAmount: string;
  overrideOpeningBalance?: boolean;
  lastConfirmedClosing?: string;
}) {
  const split = deriveHomelineSplit({
    priorRemaining: input.priorRemaining,
    remainingBalance: input.facts.mortgageOutstanding,
    paymentAmount: input.facts.paymentsReceived,
    regularPaymentAmount: input.regularPaymentAmount,
  });
  const payment = proveStatementPayment({
    paymentAmount: input.facts.paymentsReceived,
    remainingBalance: input.facts.mortgageOutstanding,
    priorRemaining: input.priorRemaining,
    ...split,
  });
  const opening = input.lastConfirmedClosing
    ? proveOpeningBalance({
        expectedOpening: input.lastConfirmedClosing,
        actualOpening: input.priorRemaining,
        override: input.overrideOpeningBalance,
      })
    : { ok: true, reasons: [] as string[] };
  const reasons = [...payment.reasons, ...opening.reasons];
  return { canConfirm: reasons.length === 0, reasons, split };
}
