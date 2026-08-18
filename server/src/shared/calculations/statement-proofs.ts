export function toCents(value: string | number): number {
  return Math.round(Number(value) * 100);
}

export type DerivedStatementSplit = {
  regularPaymentAmount: string;
  prepaymentAmount: string;
  principalPaid: string;
  interestPaid: string;
  isMissed: 0 | 1;
};

export function deriveHomelineSplit(input: {
  priorRemaining: string;
  remainingBalance: string;
  paymentAmount: string;
  regularPaymentAmount: string;
}): DerivedStatementSplit {
  const paymentCents = toCents(input.paymentAmount);
  const priorCents = toCents(input.priorRemaining);
  const remainingCents = toCents(input.remainingBalance);
  const regularCents = toCents(input.regularPaymentAmount);
  const isMissed = paymentCents === 0 && priorCents === remainingCents ? 1 : 0;
  const principalCents = priorCents - remainingCents;
  const interestCents = paymentCents - principalCents;
  const prepaymentCents = Math.max(0, paymentCents - regularCents);

  return {
    regularPaymentAmount: (regularCents / 100).toFixed(2),
    prepaymentAmount: (prepaymentCents / 100).toFixed(2),
    principalPaid: (principalCents / 100).toFixed(2),
    interestPaid: (interestCents / 100).toFixed(2),
    isMissed,
  };
}

export type StatementProof = {
  ok: boolean;
  reasons: string[];
};

export function proveStatementPayment(input: {
  paymentAmount: string;
  regularPaymentAmount: string;
  prepaymentAmount: string;
  principalPaid: string;
  interestPaid: string;
  priorRemaining: string;
  remainingBalance: string;
}): StatementProof {
  const reasons: string[] = [];
  if (
    toCents(input.paymentAmount) !==
    toCents(input.regularPaymentAmount) + toCents(input.prepaymentAmount)
  ) {
    reasons.push("Payment parts do not add up");
  }
  if (toCents(input.paymentAmount) !== toCents(input.principalPaid) + toCents(input.interestPaid)) {
    reasons.push("Principal and interest do not add up");
  }
  if (
    toCents(input.priorRemaining) - toCents(input.remainingBalance) !==
    toCents(input.principalPaid)
  ) {
    reasons.push("Balance chain is invalid");
  }
  return { ok: reasons.length === 0, reasons };
}

export function proveOpeningBalance(input: {
  expectedOpening: string;
  actualOpening: string;
  override?: boolean;
}): StatementProof {
  if (input.override || toCents(input.expectedOpening) === toCents(input.actualOpening)) {
    return { ok: true, reasons: [] };
  }
  return {
    ok: false,
    reasons: [
      `Opening balance ${input.actualOpening} does not match last confirmed closing ${input.expectedOpening}`,
    ],
  };
}
