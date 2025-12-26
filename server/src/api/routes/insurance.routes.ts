import { Router } from "express";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import { InsuranceCalculatorService } from "@application/services/insurance-calculator.service";
import { z } from "zod";

const router = Router();
const insuranceCalculator = new InsuranceCalculatorService();

// Validation schema
const calculateInsuranceSchema = z.object({
  propertyPrice: z.number().positive("Property price must be greater than zero"),
  downPayment: z.number().min(0, "Down payment cannot be negative"),
  provider: z.enum(["CMHC", "Sagen", "Genworth"]),
  mliSelectDiscount: z
    .union([z.literal(0), z.literal(10), z.literal(20), z.literal(30)])
    .optional(),
  premiumPaymentType: z.enum(["upfront", "added-to-principal"]).optional(),
});

/**
 * POST /api/insurance/calculate
 * Calculate mortgage default insurance premium
 */
router.post("/calculate", requireUser, async (req, res) => {
  try {
    // Validate request body
    const validationResult = calculateInsuranceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return sendError(res, 400, "Invalid request data", validationResult.error.errors);
    }

    const { propertyPrice, downPayment, provider, mliSelectDiscount, premiumPaymentType } =
      validationResult.data;

    // Additional validation: down payment must be less than property price
    if (downPayment >= propertyPrice) {
      return sendError(res, 400, "Down payment must be less than property price");
    }

    // Calculate insurance premium
    const result = insuranceCalculator.calculate({
      propertyPrice,
      downPayment,
      provider,
      mliSelectDiscount: mliSelectDiscount || 0,
      premiumPaymentType: premiumPaymentType || "upfront",
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error calculating insurance premium:", error);
    if (error instanceof Error) {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, "Failed to calculate insurance premium");
  }
});

/**
 * POST /api/insurance/compare
 * Compare premiums across all providers
 */
router.post("/compare", requireUser, async (req, res) => {
  try {
    // Validate request body (same schema but provider is optional)
    const compareSchema = calculateInsuranceSchema.omit({ provider: true });
    const validationResult = compareSchema.safeParse(req.body);
    if (!validationResult.success) {
      return sendError(res, 400, "Invalid request data", validationResult.error.errors);
    }

    const { propertyPrice, downPayment, mliSelectDiscount, premiumPaymentType } =
      validationResult.data;

    // Additional validation
    if (downPayment >= propertyPrice) {
      return sendError(res, 400, "Down payment must be less than property price");
    }

    // Compare all providers
    const results = insuranceCalculator.compareProviders(
      propertyPrice,
      downPayment,
      mliSelectDiscount,
      premiumPaymentType
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error comparing insurance premiums:", error);
    if (error instanceof Error) {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, "Failed to compare insurance premiums");
  }
});

/**
 * GET /api/insurance/rates/:provider
 * Get premium rate table for a specific provider
 */
router.get("/rates/:provider", requireUser, async (req, res) => {
  try {
    const { provider } = req.params;

    if (provider !== "CMHC" && provider !== "Sagen" && provider !== "Genworth") {
      return sendError(res, 400, "Invalid provider. Must be CMHC, Sagen, or Genworth");
    }

    const rateTable = insuranceCalculator.getPremiumRateTable(
      provider as "CMHC" | "Sagen" | "Genworth"
    );

    return res.status(200).json({
      provider,
      rateTable,
      note: "Rates are percentages of mortgage amount. Verify current rates with official sources.",
    });
  } catch (error) {
    console.error("Error fetching premium rate table:", error);
    return sendError(res, 500, "Failed to fetch premium rate table");
  }
});

export default router;
