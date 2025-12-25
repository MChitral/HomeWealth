import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../app";
import { db } from "@infrastructure/db/connection";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

describe("Insurance API Routes", () => {
  let testUser: { id: string; email: string };
  let authCookie: string;

  beforeEach(async () => {
    // Create a test user
    const [user] = await db
      .insert(users)
      .values({
        email: `test-${Date.now()}@example.com`,
        firstName: "Test",
        lastName: "User",
      })
      .returning();

    testUser = user;

    // Mock authentication by setting a session cookie
    // In a real test, you'd use your actual auth mechanism
    authCookie = `session=${testUser.id}`;
  });

  describe("POST /api/insurance/calculate", () => {
    it("should calculate insurance premium for high-ratio mortgage", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 50000, // 10% down, 90% LTV
          provider: "CMHC",
          mliSelectDiscount: 0,
          premiumPaymentType: "upfront",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("isHighRatio", true);
      expect(response.body).toHaveProperty("ltvRatio", 90);
      expect(response.body).toHaveProperty("premiumRate");
      expect(response.body).toHaveProperty("premiumAmount");
      expect(response.body).toHaveProperty("premiumAfterDiscount");
      expect(response.body).toHaveProperty("mortgageAmount", 450000);
      expect(response.body).toHaveProperty("provider", "CMHC");
      expect(response.body).toHaveProperty("breakdown");
      expect(response.body.breakdown).toHaveProperty("basePremium");
      expect(response.body.breakdown).toHaveProperty("discountAmount");
      expect(response.body.breakdown).toHaveProperty("finalPremium");
    });

    it("should return no insurance for conventional mortgage", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 100000, // 20% down
          provider: "CMHC",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("isHighRatio", false);
      expect(response.body).toHaveProperty("premiumRate", 0);
      expect(response.body).toHaveProperty("premiumAmount", 0);
    });

    it("should apply MLI Select discount", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 50000,
          provider: "CMHC",
          mliSelectDiscount: 20,
          premiumPaymentType: "upfront",
        });

      expect(response.status).toBe(200);
      expect(response.body.breakdown.discountAmount).toBeGreaterThan(0);
      expect(response.body.premiumAfterDiscount).toBeLessThan(
        response.body.breakdown.basePremium
      );
    });

    it("should add premium to principal when requested", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 50000,
          provider: "CMHC",
          premiumPaymentType: "added-to-principal",
        });

      expect(response.status).toBe(200);
      expect(response.body.totalMortgageAmount).toBeGreaterThan(
        response.body.mortgageAmount
      );
      expect(response.body.totalMortgageAmount).toBe(
        response.body.mortgageAmount + response.body.premiumAfterDiscount
      );
    });

    it("should validate property price", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 0,
          downPayment: 0,
          provider: "CMHC",
        });

      expect(response.status).toBe(400);
    });

    it("should validate down payment", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: -1000,
          provider: "CMHC",
        });

      expect(response.status).toBe(400);
    });

    it("should validate down payment less than property price", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 600000,
          provider: "CMHC",
        });

      expect(response.status).toBe(400);
    });

    it("should validate provider", async () => {
      const response = await request(app)
        .post("/api/insurance/calculate")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 50000,
          provider: "InvalidProvider",
        });

      expect(response.status).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await request(app).post("/api/insurance/calculate").send({
        propertyPrice: 500000,
        downPayment: 50000,
        provider: "CMHC",
      });

      // Adjust based on your auth implementation
      expect([401, 403]).toContain(response.status);
    });
  });

  describe("POST /api/insurance/compare", () => {
    it("should compare all providers", async () => {
      const response = await request(app)
        .post("/api/insurance/compare")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 50000,
          mliSelectDiscount: 0,
          premiumPaymentType: "upfront",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("CMHC");
      expect(response.body).toHaveProperty("Sagen");
      expect(response.body).toHaveProperty("Genworth");

      expect(response.body.CMHC).toHaveProperty("isHighRatio", true);
      expect(response.body.Sagen).toHaveProperty("isHighRatio", true);
      expect(response.body.Genworth).toHaveProperty("isHighRatio", true);
    });

    it("should apply discount to comparison", async () => {
      const response = await request(app)
        .post("/api/insurance/compare")
        .set("Cookie", authCookie)
        .send({
          propertyPrice: 500000,
          downPayment: 50000,
          mliSelectDiscount: 20,
          premiumPaymentType: "upfront",
        });

      expect(response.status).toBe(200);
      expect(response.body.CMHC.breakdown.discountAmount).toBeGreaterThan(0);
      expect(response.body.Sagen.breakdown.discountAmount).toBeGreaterThan(0);
      expect(response.body.Genworth.breakdown.discountAmount).toBeGreaterThan(0);
    });
  });

  describe("GET /api/insurance/rates/:provider", () => {
    it("should return rate table for CMHC", async () => {
      const response = await request(app)
        .get("/api/insurance/rates/CMHC")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("provider", "CMHC");
      expect(response.body).toHaveProperty("rateTable");
      expect(response.body.rateTable).toHaveProperty("65-75");
      expect(response.body.rateTable).toHaveProperty("95-100");
    });

    it("should return rate table for Sagen", async () => {
      const response = await request(app)
        .get("/api/insurance/rates/Sagen")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("provider", "Sagen");
      expect(response.body).toHaveProperty("rateTable");
    });

    it("should return rate table for Genworth", async () => {
      const response = await request(app)
        .get("/api/insurance/rates/Genworth")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("provider", "Genworth");
      expect(response.body).toHaveProperty("rateTable");
    });

    it("should reject invalid provider", async () => {
      const response = await request(app)
        .get("/api/insurance/rates/InvalidProvider")
        .set("Cookie", authCookie);

      expect(response.status).toBe(400);
    });
  });
});

