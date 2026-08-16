import "../server/src/config/loadEnv";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Pool, type PoolClient } from "pg";
import { z } from "zod";
import { INTEREST_ACCRUAL_BASES } from "../shared/mortgage-ledger";

const money = z.union([z.string(), z.number()]).transform((value) => Number(value).toFixed(2));
const rate = z.union([z.string(), z.number()]).transform((value) => Number(value).toFixed(3));

const targetSchema = z.object({
  mortgage: z.object({
    id: z.string().min(1),
    expectedCurrentBalance: money,
    originalAmount: money,
    currentBalance: money,
    startDate: z.string(),
    annualPrepaymentLimitPercent: z.number().int(),
    prepaymentLimitResetDate: z.string(),
    lenderName: z.string().min(1),
  }),
  term: z.object({
    id: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    interestAccrualBasis: z.enum(INTEREST_ACCRUAL_BASES),
  }),
  removePaymentIds: z.array(z.string().min(1)),
  payments: z.array(
    z.object({
      id: z.string().min(1),
      paymentDate: z.string(),
      paymentPeriodLabel: z.string(),
      regularPaymentAmount: money,
      prepaymentAmount: money,
      paymentAmount: money,
      principalPaid: money,
      interestPaid: money,
      remainingBalance: money,
      primeRate: rate,
      effectiveRate: rate,
      remainingAmortizationMonths: z.number().int().positive(),
    })
  ),
  primeRates: z.array(
    z.object({
      effectiveDate: z.string(),
      primeRate: rate,
      source: z.string().min(1),
    })
  ),
});

type ReconciliationTarget = z.infer<typeof targetSchema>;

type Arguments = {
  inputPath: string;
  mortgageId: string;
  shouldApply: boolean;
};

function parseArguments(argv: string[]): Arguments {
  const getValue = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const inputPath = getValue("--input");
  const mortgageId = getValue("--mortgage-id");
  if (!inputPath || !mortgageId) {
    throw new Error(
      "Usage: tsx scripts/reconcile-mortgage.ts --input <target.json> --mortgage-id <id> [--apply]"
    );
  }
  return {
    inputPath: path.resolve(inputPath),
    mortgageId,
    shouldApply: argv.includes("--apply"),
  };
}

function assertLocalDatabase(connectionString: string): void {
  const hostname = new URL(connectionString).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error(`Refusing to reconcile a non-local database host: ${hostname}`);
  }
}

function toCents(value: string): number {
  return Math.round(Number(value) * 100);
}

function validateTarget(target: ReconciliationTarget): void {
  const paymentIds = new Set<string>();
  let previousBalance = toCents(target.mortgage.originalAmount);

  for (const payment of [...target.payments].sort((left, right) =>
    left.paymentDate.localeCompare(right.paymentDate)
  )) {
    if (paymentIds.has(payment.id)) {
      throw new Error(`Duplicate target payment ID: ${payment.id}`);
    }
    paymentIds.add(payment.id);

    if (
      toCents(payment.paymentAmount) !==
      toCents(payment.regularPaymentAmount) + toCents(payment.prepaymentAmount)
    ) {
      throw new Error(`Payment parts do not add up for ${payment.id}`);
    }
    if (
      toCents(payment.paymentAmount) !==
      toCents(payment.principalPaid) + toCents(payment.interestPaid)
    ) {
      throw new Error(`Principal and interest do not add up for ${payment.id}`);
    }
    if (previousBalance - toCents(payment.remainingBalance) !== toCents(payment.principalPaid)) {
      throw new Error(`Balance chain is invalid for ${payment.id}`);
    }
    previousBalance = toCents(payment.remainingBalance);
  }

  if (previousBalance !== toCents(target.mortgage.currentBalance)) {
    throw new Error("The final target payment does not match the target mortgage balance");
  }
}

function getBackupDirectory(mortgageId: string): string {
  const localAppData = process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(
    localAppData,
    "HomeWealth",
    "backups",
    "mortgage-reconciliation",
    mortgageId,
    timestamp
  );
}

async function loadBeforeSnapshot(client: PoolClient, mortgageId: string) {
  const mortgage = await client.query("SELECT * FROM mortgages WHERE id = $1 FOR UPDATE", [
    mortgageId,
  ]);
  if (mortgage.rowCount !== 1) {
    throw new Error(`Mortgage ${mortgageId} was not found`);
  }
  const terms = await client.query(
    "SELECT * FROM mortgage_terms WHERE mortgage_id = $1 ORDER BY start_date FOR UPDATE",
    [mortgageId]
  );
  const payments = await client.query(
    "SELECT * FROM mortgage_payments WHERE mortgage_id = $1 ORDER BY payment_date, created_at FOR UPDATE",
    [mortgageId]
  );
  const corrections = await client.query(
    `SELECT pc.*
       FROM payment_corrections pc
       JOIN mortgage_payments mp ON mp.id = pc.payment_id
      WHERE mp.mortgage_id = $1`,
    [mortgageId]
  );
  return {
    capturedAt: new Date().toISOString(),
    mortgage: mortgage.rows[0],
    terms: terms.rows,
    payments: payments.rows,
    corrections: corrections.rows,
  };
}

async function writeBackup(
  backupDirectory: string,
  snapshot: unknown,
  target: ReconciliationTarget
): Promise<void> {
  await mkdir(backupDirectory, { recursive: true });
  const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;
  await writeFile(path.join(backupDirectory, "before.json"), snapshotJson, "utf8");
  await writeFile(
    path.join(backupDirectory, "before.sha256"),
    `${createHash("sha256").update(snapshotJson).digest("hex")}  before.json\n`,
    "utf8"
  );
  await writeFile(
    path.join(backupDirectory, "target.json"),
    `${JSON.stringify(target, null, 2)}\n`,
    "utf8"
  );
}

function assertExpectedState(
  snapshot: Awaited<ReturnType<typeof loadBeforeSnapshot>>,
  target: ReconciliationTarget
): void {
  if (
    Number(snapshot.mortgage.current_balance).toFixed(2) !== target.mortgage.expectedCurrentBalance
  ) {
    throw new Error(
      `Current balance changed: expected ${target.mortgage.expectedCurrentBalance}, found ${snapshot.mortgage.current_balance}`
    );
  }
  if (snapshot.terms.length !== 1 || snapshot.terms[0].id !== target.term.id) {
    throw new Error("The live mortgage term does not match the reconciliation target");
  }

  const expectedIds = new Set([
    ...target.payments.map((payment) => payment.id),
    ...target.removePaymentIds,
  ]);
  const actualIds = new Set(snapshot.payments.map((payment) => payment.id as string));
  if (
    expectedIds.size !== actualIds.size ||
    Array.from(expectedIds).some((paymentId) => !actualIds.has(paymentId))
  ) {
    throw new Error("The live payment IDs do not match the reconciliation target");
  }
  if (snapshot.corrections.length !== 0) {
    throw new Error("Payment corrections appeared after the target was prepared");
  }
}

async function applyTarget(client: PoolClient, target: ReconciliationTarget): Promise<void> {
  for (const payment of target.payments) {
    const result = await client.query(
      `UPDATE mortgage_payments
          SET payment_date = $1,
              payment_period_label = $2,
              regular_payment_amount = $3,
              prepayment_amount = $4,
              payment_amount = $5,
              principal_paid = $6,
              interest_paid = $7,
              remaining_balance = $8,
              prime_rate = $9,
              effective_rate = $10,
              trigger_rate_hit = 0,
              calculation_source = 'statement',
              is_skipped = 0,
              skipped_interest_accrued = '0.00',
              remaining_amortization_months = $11
        WHERE id = $12 AND mortgage_id = $13`,
      [
        payment.paymentDate,
        payment.paymentPeriodLabel,
        payment.regularPaymentAmount,
        payment.prepaymentAmount,
        payment.paymentAmount,
        payment.principalPaid,
        payment.interestPaid,
        payment.remainingBalance,
        payment.primeRate,
        payment.effectiveRate,
        payment.remainingAmortizationMonths,
        payment.id,
        target.mortgage.id,
      ]
    );
    if (result.rowCount !== 1) {
      throw new Error(`Failed to update target payment ${payment.id}`);
    }
  }

  for (const paymentId of target.removePaymentIds) {
    const result = await client.query(
      "DELETE FROM mortgage_payments WHERE id = $1 AND mortgage_id = $2",
      [paymentId, target.mortgage.id]
    );
    if (result.rowCount !== 1) {
      throw new Error(`Failed to remove target payment ${paymentId}`);
    }
  }

  await client.query(
    `UPDATE mortgages
        SET original_amount = $1,
            current_balance = $2,
            start_date = $3,
            annual_prepayment_limit_percent = $4,
            prepayment_limit_reset_date = $5,
            lender_name = $6,
            updated_at = now()
      WHERE id = $7`,
    [
      target.mortgage.originalAmount,
      target.mortgage.currentBalance,
      target.mortgage.startDate,
      target.mortgage.annualPrepaymentLimitPercent,
      target.mortgage.prepaymentLimitResetDate,
      target.mortgage.lenderName,
      target.mortgage.id,
    ]
  );

  await client.query(
    `UPDATE mortgage_terms
        SET start_date = $1,
            end_date = $2,
            interest_accrual_basis = $3
      WHERE id = $4 AND mortgage_id = $5`,
    [
      target.term.startDate,
      target.term.endDate,
      target.term.interestAccrualBasis,
      target.term.id,
      target.mortgage.id,
    ]
  );

  for (const primeRate of target.primeRates) {
    const exists = await client.query(
      `SELECT 1
         FROM prime_rate_history
        WHERE effective_date = $1 AND prime_rate = $2 AND source = $3`,
      [primeRate.effectiveDate, primeRate.primeRate, primeRate.source]
    );
    if (exists.rowCount === 0) {
      await client.query(
        `INSERT INTO prime_rate_history (prime_rate, effective_date, source)
         VALUES ($1, $2, $3)`,
        [primeRate.primeRate, primeRate.effectiveDate, primeRate.source]
      );
    }
  }
}

async function verifyTarget(client: PoolClient, target: ReconciliationTarget) {
  const summary = await client.query(
    `WITH ordered AS (
       SELECT *,
              COALESCE(
                lag(remaining_balance) OVER (ORDER BY payment_date, id),
                $2::numeric
              ) AS prior_balance
         FROM mortgage_payments
        WHERE mortgage_id = $1
     )
     SELECT count(*)::int AS rows,
            sum(payment_amount)::text AS payments,
            sum(principal_paid)::text AS principal,
            sum(interest_paid)::text AS interest,
            bool_and(payment_amount = regular_payment_amount + prepayment_amount) AS payment_parts_ok,
            bool_and(payment_amount = principal_paid + interest_paid) AS split_ok,
            bool_and(prior_balance - remaining_balance = principal_paid) AS balance_chain_ok
       FROM ordered`,
    [target.mortgage.id, target.mortgage.originalAmount]
  );
  const balance = await client.query(
    `SELECT m.current_balance::text AS mortgage_balance,
            p.remaining_balance::text AS latest_payment_balance
       FROM mortgages m
       JOIN LATERAL (
         SELECT remaining_balance
           FROM mortgage_payments
          WHERE mortgage_id = m.id
          ORDER BY payment_date DESC, id DESC
          LIMIT 1
       ) p ON true
      WHERE m.id = $1`,
    [target.mortgage.id]
  );
  const result = { summary: summary.rows[0], balance: balance.rows[0] };
  if (
    result.summary.rows !== target.payments.length ||
    !result.summary.payment_parts_ok ||
    !result.summary.split_ok ||
    !result.summary.balance_chain_ok ||
    Number(result.balance.mortgage_balance).toFixed(2) !== target.mortgage.currentBalance ||
    Number(result.balance.latest_payment_balance).toFixed(2) !== target.mortgage.currentBalance
  ) {
    throw new Error(`Reconciliation verification failed: ${JSON.stringify(result)}`);
  }
  return result;
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }
  assertLocalDatabase(connectionString);

  const target = targetSchema.parse(JSON.parse(await readFile(args.inputPath, "utf8")));
  if (target.mortgage.id !== args.mortgageId) {
    throw new Error("The input mortgage ID does not match --mortgage-id");
  }
  validateTarget(target);

  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  let backupDirectory = "";
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [args.mortgageId]);
    const snapshot = await loadBeforeSnapshot(client, args.mortgageId);
    assertExpectedState(snapshot, target);
    backupDirectory = getBackupDirectory(args.mortgageId);
    await writeBackup(backupDirectory, snapshot, target);

    await applyTarget(client, target);
    const verification = await verifyTarget(client, target);
    await writeFile(
      path.join(backupDirectory, "verification.json"),
      `${JSON.stringify(
        {
          mode: args.shouldApply ? "apply" : "dry-run",
          verifiedAt: new Date().toISOString(),
          ...verification,
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    if (args.shouldApply) {
      await client.query("COMMIT");
      console.log(`Reconciliation committed. Backup: ${backupDirectory}`);
    } else {
      await client.query("ROLLBACK");
      console.log(`Dry run passed; transaction rolled back. Backup: ${backupDirectory}`);
    }
    console.log(JSON.stringify(verification));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
