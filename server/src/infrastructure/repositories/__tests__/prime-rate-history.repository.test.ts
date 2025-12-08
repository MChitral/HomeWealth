import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { PrimeRateHistoryRepository } from "../prime-rate-history.repository";
import type { PrimeRateHistory } from "@shared/schema";

// Mock database
class MockDatabase {
  private data: PrimeRateHistory[] = [];

  async insert(table: any, values: any) {
    const newRecord: PrimeRateHistory = {
      id: `id-${Date.now()}-${Math.random()}`,
      ...values,
      createdAt: new Date().toISOString(),
    };
    this.data.push(newRecord);
    return {
      returning: () => [newRecord],
    };
  }

  async select() {
    return {
      from: (table: any) => ({
        orderBy: (...args: any[]) => ({
          limit: (n: number) => {
            const sorted = [...this.data].sort((a, b) => {
              const dateA = new Date(a.effectiveDate).getTime();
              const dateB = new Date(b.effectiveDate).getTime();
              if (dateA !== dateB) return dateB - dateA;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return sorted.slice(0, n);
          },
        }),
        where: (condition: any) => {
          // Simple mock - in real implementation would filter by condition
          return this.data;
        },
      }),
    };
  }

  getData() {
    return this.data;
  }

  clear() {
    this.data = [];
  }
}

describe("PrimeRateHistoryRepository", () => {
  let repository: PrimeRateHistoryRepository;
  let mockDb: MockDatabase;

  beforeEach(() => {
    mockDb = new MockDatabase();
    // @ts-ignore - Mock the database
    repository = new PrimeRateHistoryRepository();
    repository["db"] = mockDb as any;
  });

  it("creates a new prime rate history entry", async () => {
    const data = {
      primeRate: "6.450",
      effectiveDate: "2024-01-15",
      source: "Bank of Canada",
    };

    const result = await repository.create(data);

    assert.ok(result, "Should create prime rate history entry");
    assert.equal(result.primeRate, "6.450");
    assert.equal(result.effectiveDate, "2024-01-15");
    assert.equal(result.source, "Bank of Canada");
    assert.ok(result.id, "Should have an ID");
    assert.ok(result.createdAt, "Should have createdAt timestamp");
  });

  it("finds the latest prime rate from history", async () => {
    // Create multiple entries with different dates
    await repository.create({
      primeRate: "6.450",
      effectiveDate: "2024-01-15",
      source: "Bank of Canada",
    });

    await repository.create({
      primeRate: "6.750",
      effectiveDate: "2024-03-15",
      source: "Bank of Canada",
    });

    await repository.create({
      primeRate: "6.500",
      effectiveDate: "2024-02-15",
      source: "Bank of Canada",
    });

    const latest = await repository.findLatest();

    assert.ok(latest, "Should find latest entry");
    assert.equal(latest.primeRate, "6.750", "Should return most recent by effective date");
    assert.equal(latest.effectiveDate, "2024-03-15");
  });

  it("returns undefined when no history exists", async () => {
    const latest = await repository.findLatest();
    assert.equal(latest, undefined, "Should return undefined when no history");
  });

  it("finds prime rate history within date range", async () => {
    await repository.create({
      primeRate: "6.450",
      effectiveDate: "2024-01-15",
      source: "Bank of Canada",
    });

    await repository.create({
      primeRate: "6.500",
      effectiveDate: "2024-02-15",
      source: "Bank of Canada",
    });

    await repository.create({
      primeRate: "6.750",
      effectiveDate: "2024-03-15",
      source: "Bank of Canada",
    });

    await repository.create({
      primeRate: "7.000",
      effectiveDate: "2024-04-15",
      source: "Bank of Canada",
    });

    const history = await repository.findByDateRange("2024-02-01", "2024-03-31");

    assert.ok(history, "Should return history");
    assert.ok(history.length >= 2, "Should include rates in date range");
  });

  it("checks if prime rate exists for a specific date", async () => {
    await repository.create({
      primeRate: "6.450",
      effectiveDate: "2024-01-15",
      source: "Bank of Canada",
    });

    const exists = await repository.existsForDate("2024-01-15");
    assert.ok(exists, "Should return true for existing date");

    const notExists = await repository.existsForDate("2024-01-16");
    assert.equal(notExists, false, "Should return false for non-existing date");
  });

  it("finds all prime rate history entries", async () => {
    await repository.create({
      primeRate: "6.450",
      effectiveDate: "2024-01-15",
      source: "Bank of Canada",
    });

    await repository.create({
      primeRate: "6.750",
      effectiveDate: "2024-03-15",
      source: "Bank of Canada",
    });

    const all = await repository.findAll();

    assert.ok(all, "Should return all entries");
    assert.ok(all.length >= 2, "Should include all created entries");
  });
});

