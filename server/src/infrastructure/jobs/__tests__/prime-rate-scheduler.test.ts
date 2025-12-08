import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import * as cron from "node-cron";
import { startPrimeRateScheduler } from "../prime-rate-scheduler";
import type { PrimeRateTrackingService } from "@application/services/prime-rate-tracking.service";

describe("Prime Rate Scheduler", () => {
  let mockPrimeRateTracking: PrimeRateTrackingService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    
    mockPrimeRateTracking = {
      checkAndUpdatePrimeRate: async () => ({
        changed: false,
        newRate: 6.450,
        effectiveDate: "2024-01-15",
        termsUpdated: 0,
        errors: [],
      }),
    } as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clean up any scheduled tasks
    cron.getTasks().forEach(task => task.stop());
  });

  it("starts scheduler when enabled", () => {
    process.env.ENABLE_PRIME_RATE_SCHEDULER = "true";
    process.env.NODE_ENV = "test";

    // Should not throw
    startPrimeRateScheduler(mockPrimeRateTracking);

    // Verify scheduler is running (check that tasks exist)
    const tasks = cron.getTasks();
    assert.ok(tasks.size > 0, "Scheduler should create tasks");
  });

  it("does not start scheduler when disabled", () => {
    process.env.ENABLE_PRIME_RATE_SCHEDULER = "false";
    process.env.NODE_ENV = "test";

    const initialTaskCount = cron.getTasks().size;
    startPrimeRateScheduler(mockPrimeRateTracking);

    const finalTaskCount = cron.getTasks().size;
    assert.equal(finalTaskCount, initialTaskCount, "Should not create tasks when disabled");
  });

  it("uses custom schedule from environment variable", () => {
    process.env.ENABLE_PRIME_RATE_SCHEDULER = "true";
    process.env.PRIME_RATE_SCHEDULE = "0 10 * * *"; // 10 AM
    process.env.NODE_ENV = "test";

    // Should not throw with custom schedule
    startPrimeRateScheduler(mockPrimeRateTracking);

    const tasks = cron.getTasks();
    assert.ok(tasks.size > 0, "Scheduler should create tasks with custom schedule");
  });

  it("is disabled by default in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.ENABLE_PRIME_RATE_SCHEDULER;

    const initialTaskCount = cron.getTasks().size;
    startPrimeRateScheduler(mockPrimeRateTracking);

    const finalTaskCount = cron.getTasks().size;
    assert.equal(finalTaskCount, initialTaskCount, "Should not create tasks in development by default");
  });

  it("is enabled by default in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.ENABLE_PRIME_RATE_SCHEDULER;

    startPrimeRateScheduler(mockPrimeRateTracking);

    const tasks = cron.getTasks();
    assert.ok(tasks.size > 0, "Should create tasks in production by default");
  });
});

