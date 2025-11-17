import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCashFlowSchema,
  insertEmergencyFundSchema,
  insertMortgageSchema,
  insertMortgageTermSchema,
  insertMortgagePaymentSchema,
  insertScenarioSchema,
  insertPrepaymentEventSchema,
} from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Cash Flow Routes
  app.get("/api/cash-flow", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const cashFlow = await storage.getCashFlow(req.user.id);
    res.json(cashFlow || null);
  });

  app.post("/api/cash-flow", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const data = insertCashFlowSchema.parse({ ...req.body, userId: req.user.id });
      const cashFlow = await storage.createCashFlow(data);
      res.json(cashFlow);
    } catch (error) {
      res.status(400).json({ error: "Invalid cash flow data", details: error });
    }
  });

  app.patch("/api/cash-flow/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const existing = await storage.getCashFlow(req.user.id);
      if (!existing || existing.id !== req.params.id) {
        return res.status(404).json({ error: "Cash flow not found" });
      }
      const updated = await storage.updateCashFlow(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  // Emergency Fund Routes
  app.get("/api/emergency-fund", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const ef = await storage.getEmergencyFund(req.user.id);
    res.json(ef || null);
  });

  app.post("/api/emergency-fund", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const data = insertEmergencyFundSchema.parse({ ...req.body, userId: req.user.id });
      const ef = await storage.createEmergencyFund(data);
      res.json(ef);
    } catch (error) {
      res.status(400).json({ error: "Invalid emergency fund data", details: error });
    }
  });

  app.patch("/api/emergency-fund/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const existing = await storage.getEmergencyFund(req.user.id);
      if (!existing || existing.id !== req.params.id) {
        return res.status(404).json({ error: "Emergency fund not found" });
      }
      const updated = await storage.updateEmergencyFund(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  // Mortgage Routes
  app.get("/api/mortgages", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mortgages = await storage.getMortgagesByUser(req.user.id);
    res.json(mortgages);
  });

  app.get("/api/mortgages/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mortgage = await storage.getMortgage(req.params.id);
    if (!mortgage || mortgage.userId !== req.user.id) {
      return res.status(404).json({ error: "Mortgage not found" });
    }
    res.json(mortgage);
  });

  app.post("/api/mortgages", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const data = insertMortgageSchema.parse({ ...req.body, userId: req.user.id });
      const mortgage = await storage.createMortgage(data);
      res.json(mortgage);
    } catch (error) {
      res.status(400).json({ error: "Invalid mortgage data", details: error });
    }
  });

  app.patch("/api/mortgages/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const mortgage = await storage.getMortgage(req.params.id);
      if (!mortgage || mortgage.userId !== req.user.id) {
        return res.status(404).json({ error: "Mortgage not found" });
      }
      const updated = await storage.updateMortgage(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  app.delete("/api/mortgages/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mortgage = await storage.getMortgage(req.params.id);
    if (!mortgage || mortgage.userId !== req.user.id) {
      return res.status(404).json({ error: "Mortgage not found" });
    }
    await storage.deleteMortgage(req.params.id);
    res.json({ success: true });
  });

  // Mortgage Terms Routes
  app.get("/api/mortgages/:mortgageId/terms", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mortgage = await storage.getMortgage(req.params.mortgageId);
    if (!mortgage || mortgage.userId !== req.user.id) {
      return res.status(404).json({ error: "Mortgage not found" });
    }
    const terms = await storage.getMortgageTermsByMortgage(req.params.mortgageId);
    res.json(terms);
  });

  app.post("/api/mortgages/:mortgageId/terms", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const mortgage = await storage.getMortgage(req.params.mortgageId);
      if (!mortgage || mortgage.userId !== req.user.id) {
        return res.status(404).json({ error: "Mortgage not found" });
      }
      const data = insertMortgageTermSchema.parse({ ...req.body, mortgageId: req.params.mortgageId });
      const term = await storage.createMortgageTerm(data);
      res.json(term);
    } catch (error) {
      res.status(400).json({ error: "Invalid term data", details: error });
    }
  });

  app.patch("/api/mortgage-terms/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const term = await storage.getMortgageTerm(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Term not found" });
      }
      const mortgage = await storage.getMortgage(term.mortgageId);
      if (!mortgage || mortgage.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await storage.updateMortgageTerm(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  app.delete("/api/mortgage-terms/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const term = await storage.getMortgageTerm(req.params.id);
    if (!term) {
      return res.status(404).json({ error: "Term not found" });
    }
    const mortgage = await storage.getMortgage(term.mortgageId);
    if (!mortgage || mortgage.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await storage.deleteMortgageTerm(req.params.id);
    res.json({ success: true });
  });

  // Mortgage Payments Routes
  app.get("/api/mortgages/:mortgageId/payments", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mortgage = await storage.getMortgage(req.params.mortgageId);
    if (!mortgage || mortgage.userId !== req.user.id) {
      return res.status(404).json({ error: "Mortgage not found" });
    }
    const payments = await storage.getMortgagePaymentsByMortgage(req.params.mortgageId);
    res.json(payments);
  });

  app.get("/api/mortgage-terms/:termId/payments", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const term = await storage.getMortgageTerm(req.params.termId);
    if (!term) {
      return res.status(404).json({ error: "Term not found" });
    }
    const mortgage = await storage.getMortgage(term.mortgageId);
    if (!mortgage || mortgage.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const payments = await storage.getMortgagePaymentsByTerm(req.params.termId);
    res.json(payments);
  });

  app.post("/api/mortgages/:mortgageId/payments", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const mortgage = await storage.getMortgage(req.params.mortgageId);
      if (!mortgage || mortgage.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const data = insertMortgagePaymentSchema.parse({ ...req.body, mortgageId: req.params.mortgageId });
      const payment = await storage.createMortgagePayment(data);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data", details: error });
    }
  });

  // Scenario Routes
  app.get("/api/scenarios", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const scenarios = await storage.getScenariosByUser(req.user.id);
    res.json(scenarios);
  });

  app.get("/api/scenarios/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const scenario = await storage.getScenario(req.params.id);
    if (!scenario || scenario.userId !== req.user.id) {
      return res.status(404).json({ error: "Scenario not found" });
    }
    res.json(scenario);
  });

  app.post("/api/scenarios", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const data = insertScenarioSchema.parse({ ...req.body, userId: req.user.id });
      const scenario = await storage.createScenario(data);
      res.json(scenario);
    } catch (error) {
      res.status(400).json({ error: "Invalid scenario data", details: error });
    }
  });

  app.patch("/api/scenarios/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const scenario = await storage.getScenario(req.params.id);
      if (!scenario || scenario.userId !== req.user.id) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      const updated = await storage.updateScenario(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  app.delete("/api/scenarios/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const scenario = await storage.getScenario(req.params.id);
    if (!scenario || scenario.userId !== req.user.id) {
      return res.status(404).json({ error: "Scenario not found" });
    }
    await storage.deleteScenario(req.params.id);
    res.json({ success: true });
  });

  // Prepayment Events Routes
  app.get("/api/scenarios/:scenarioId/prepayment-events", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const scenario = await storage.getScenario(req.params.scenarioId);
    if (!scenario || scenario.userId !== req.user.id) {
      return res.status(404).json({ error: "Scenario not found" });
    }
    const events = await storage.getPrepaymentEventsByScenario(req.params.scenarioId);
    res.json(events);
  });

  app.post("/api/scenarios/:scenarioId/prepayment-events", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const scenario = await storage.getScenario(req.params.scenarioId);
      if (!scenario || scenario.userId !== req.user.id) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      const data = insertPrepaymentEventSchema.parse({ ...req.body, scenarioId: req.params.scenarioId });
      const event = await storage.createPrepaymentEvent(data);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data", details: error });
    }
  });

  app.patch("/api/prepayment-events/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const event = await storage.getPrepaymentEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      const scenario = await storage.getScenario(event.scenarioId);
      if (!scenario || scenario.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await storage.updatePrepaymentEvent(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  app.delete("/api/prepayment-events/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const event = await storage.getPrepaymentEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    const scenario = await storage.getScenario(event.scenarioId);
    if (!scenario || scenario.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await storage.deletePrepaymentEvent(req.params.id);
    res.json({ success: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
