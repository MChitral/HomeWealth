import {
  type User,
  type InsertUser,
  type CashFlow,
  type InsertCashFlow,
  type EmergencyFund,
  type InsertEmergencyFund,
  type Mortgage,
  type InsertMortgage,
  type MortgageTerm,
  type InsertMortgageTerm,
  type MortgagePayment,
  type InsertMortgagePayment,
  type Scenario,
  type InsertScenario,
  type PrepaymentEvent,
  type InsertPrepaymentEvent,
  users,
  cashFlow,
  emergencyFund,
  mortgages,
  mortgageTerms,
  mortgagePayments,
  scenarios,
  prepaymentEvents,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cash Flow
  getCashFlow(userId: string): Promise<CashFlow | undefined>;
  createCashFlow(cashFlow: InsertCashFlow): Promise<CashFlow>;
  updateCashFlow(id: string, cashFlow: Partial<InsertCashFlow>): Promise<CashFlow | undefined>;
  
  // Emergency Fund
  getEmergencyFund(userId: string): Promise<EmergencyFund | undefined>;
  createEmergencyFund(ef: InsertEmergencyFund): Promise<EmergencyFund>;
  updateEmergencyFund(id: string, ef: Partial<InsertEmergencyFund>): Promise<EmergencyFund | undefined>;
  
  // Mortgages
  getMortgage(id: string): Promise<Mortgage | undefined>;
  getMortgagesByUser(userId: string): Promise<Mortgage[]>;
  createMortgage(mortgage: InsertMortgage): Promise<Mortgage>;
  updateMortgage(id: string, mortgage: Partial<InsertMortgage>): Promise<Mortgage | undefined>;
  deleteMortgage(id: string): Promise<boolean>;
  
  // Mortgage Terms
  getMortgageTerm(id: string): Promise<MortgageTerm | undefined>;
  getMortgageTermsByMortgage(mortgageId: string): Promise<MortgageTerm[]>;
  createMortgageTerm(term: InsertMortgageTerm): Promise<MortgageTerm>;
  updateMortgageTerm(id: string, term: Partial<InsertMortgageTerm>): Promise<MortgageTerm | undefined>;
  deleteMortgageTerm(id: string): Promise<boolean>;
  
  // Mortgage Payments
  getMortgagePayment(id: string): Promise<MortgagePayment | undefined>;
  getMortgagePaymentsByMortgage(mortgageId: string): Promise<MortgagePayment[]>;
  getMortgagePaymentsByTerm(termId: string): Promise<MortgagePayment[]>;
  createMortgagePayment(payment: InsertMortgagePayment): Promise<MortgagePayment>;
  
  // Scenarios
  getScenario(id: string): Promise<Scenario | undefined>;
  getScenariosByUser(userId: string): Promise<Scenario[]>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  updateScenario(id: string, scenario: Partial<InsertScenario>): Promise<Scenario | undefined>;
  deleteScenario(id: string): Promise<boolean>;
  
  // Prepayment Events
  getPrepaymentEvent(id: string): Promise<PrepaymentEvent | undefined>;
  getPrepaymentEventsByScenario(scenarioId: string): Promise<PrepaymentEvent[]>;
  createPrepaymentEvent(event: InsertPrepaymentEvent): Promise<PrepaymentEvent>;
  updatePrepaymentEvent(id: string, event: Partial<InsertPrepaymentEvent>): Promise<PrepaymentEvent | undefined>;
  deletePrepaymentEvent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cashFlows: Map<string, CashFlow>;
  private emergencyFunds: Map<string, EmergencyFund>;
  private mortgages: Map<string, Mortgage>;
  private mortgageTerms: Map<string, MortgageTerm>;
  private mortgagePayments: Map<string, MortgagePayment>;
  private scenarios: Map<string, Scenario>;
  private prepaymentEvents: Map<string, PrepaymentEvent>;

  constructor() {
    this.users = new Map();
    this.cashFlows = new Map();
    this.emergencyFunds = new Map();
    this.mortgages = new Map();
    this.mortgageTerms = new Map();
    this.mortgagePayments = new Map();
    this.scenarios = new Map();
    this.prepaymentEvents = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Cash Flow
  async getCashFlow(userId: string): Promise<CashFlow | undefined> {
    return Array.from(this.cashFlows.values()).find(cf => cf.userId === userId);
  }
  
  async createCashFlow(insertCashFlow: InsertCashFlow): Promise<CashFlow> {
    const id = randomUUID();
    const cashFlow: CashFlow = { 
      id,
      userId: insertCashFlow.userId,
      monthlyIncome: insertCashFlow.monthlyIncome,
      extraPaycheques: insertCashFlow.extraPaycheques ?? 2,
      annualBonus: insertCashFlow.annualBonus ?? "0",
      propertyTax: insertCashFlow.propertyTax ?? "0",
      homeInsurance: insertCashFlow.homeInsurance ?? "0",
      condoFees: insertCashFlow.condoFees ?? "0",
      utilities: insertCashFlow.utilities ?? "0",
      groceries: insertCashFlow.groceries ?? "0",
      dining: insertCashFlow.dining ?? "0",
      transportation: insertCashFlow.transportation ?? "0",
      entertainment: insertCashFlow.entertainment ?? "0",
      carLoan: insertCashFlow.carLoan ?? "0",
      studentLoan: insertCashFlow.studentLoan ?? "0",
      creditCard: insertCashFlow.creditCard ?? "0",
      updatedAt: new Date() 
    };
    this.cashFlows.set(id, cashFlow);
    return cashFlow;
  }
  
  async updateCashFlow(id: string, update: Partial<InsertCashFlow>): Promise<CashFlow | undefined> {
    const existing = this.cashFlows.get(id);
    if (!existing) return undefined;
    
    const updated: CashFlow = { 
      ...existing, 
      ...update, 
      updatedAt: new Date() 
    };
    this.cashFlows.set(id, updated);
    return updated;
  }
  
  // Emergency Fund
  async getEmergencyFund(userId: string): Promise<EmergencyFund | undefined> {
    return Array.from(this.emergencyFunds.values()).find(ef => ef.userId === userId);
  }
  
  async createEmergencyFund(insertEf: InsertEmergencyFund): Promise<EmergencyFund> {
    const id = randomUUID();
    const ef: EmergencyFund = { 
      ...insertEf,
      targetMonths: insertEf.targetMonths ?? 6,
      currentBalance: insertEf.currentBalance ?? "0",
      monthlyContribution: insertEf.monthlyContribution ?? "0", 
      id, 
      updatedAt: new Date() 
    };
    this.emergencyFunds.set(id, ef);
    return ef;
  }
  
  async updateEmergencyFund(id: string, update: Partial<InsertEmergencyFund>): Promise<EmergencyFund | undefined> {
    const existing = this.emergencyFunds.get(id);
    if (!existing) return undefined;
    
    const updated: EmergencyFund = { 
      ...existing, 
      ...update, 
      updatedAt: new Date() 
    };
    this.emergencyFunds.set(id, updated);
    return updated;
  }
  
  // Mortgages
  async getMortgage(id: string): Promise<Mortgage | undefined> {
    return this.mortgages.get(id);
  }
  
  async getMortgagesByUser(userId: string): Promise<Mortgage[]> {
    return Array.from(this.mortgages.values()).filter(m => m.userId === userId);
  }
  
  async createMortgage(insertMortgage: InsertMortgage): Promise<Mortgage> {
    const id = randomUUID();
    const mortgage: Mortgage = { 
      amortizationMonths: 0,
      annualPrepaymentLimitPercent: 20,
      ...insertMortgage, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.mortgages.set(id, mortgage);
    return mortgage;
  }
  
  async updateMortgage(id: string, update: Partial<InsertMortgage>): Promise<Mortgage | undefined> {
    const existing = this.mortgages.get(id);
    if (!existing) return undefined;
    
    const updated: Mortgage = { 
      ...existing, 
      ...update, 
      updatedAt: new Date() 
    };
    this.mortgages.set(id, updated);
    return updated;
  }
  
  async deleteMortgage(id: string): Promise<boolean> {
    // Cascade delete: remove associated terms and payments
    const terms = await this.getMortgageTermsByMortgage(id);
    for (const term of terms) {
      await this.deleteMortgageTerm(term.id);
    }
    
    // Delete payments associated with this mortgage
    const payments = Array.from(this.mortgagePayments.values()).filter(p => p.mortgageId === id);
    for (const payment of payments) {
      this.mortgagePayments.delete(payment.id);
    }
    
    return this.mortgages.delete(id);
  }
  
  // Mortgage Terms
  async getMortgageTerm(id: string): Promise<MortgageTerm | undefined> {
    return this.mortgageTerms.get(id);
  }
  
  async getMortgageTermsByMortgage(mortgageId: string): Promise<MortgageTerm[]> {
    return Array.from(this.mortgageTerms.values()).filter(t => t.mortgageId === mortgageId);
  }
  
  async createMortgageTerm(insertTerm: InsertMortgageTerm): Promise<MortgageTerm> {
    const id = randomUUID();
    const term: MortgageTerm = { 
      fixedRate: null,
      lockedSpread: null,
      ...insertTerm, 
      id, 
      createdAt: new Date() 
    };
    this.mortgageTerms.set(id, term);
    return term;
  }
  
  async updateMortgageTerm(id: string, update: Partial<InsertMortgageTerm>): Promise<MortgageTerm | undefined> {
    const existing = this.mortgageTerms.get(id);
    if (!existing) return undefined;
    
    const updated: MortgageTerm = { ...existing, ...update };
    this.mortgageTerms.set(id, updated);
    return updated;
  }
  
  async deleteMortgageTerm(id: string): Promise<boolean> {
    // Cascade delete: remove associated payments
    const payments = await this.getMortgagePaymentsByTerm(id);
    for (const payment of payments) {
      this.mortgagePayments.delete(payment.id);
    }
    
    return this.mortgageTerms.delete(id);
  }
  
  // Mortgage Payments
  async getMortgagePayment(id: string): Promise<MortgagePayment | undefined> {
    return this.mortgagePayments.get(id);
  }
  
  async getMortgagePaymentsByMortgage(mortgageId: string): Promise<MortgagePayment[]> {
    return Array.from(this.mortgagePayments.values()).filter(p => p.mortgageId === mortgageId);
  }
  
  async getMortgagePaymentsByTerm(termId: string): Promise<MortgagePayment[]> {
    return Array.from(this.mortgagePayments.values()).filter(p => p.termId === termId);
  }
  
  async createMortgagePayment(insertPayment: InsertMortgagePayment): Promise<MortgagePayment> {
    const id = randomUUID();
    const payment: MortgagePayment = { 
      ...insertPayment,
      paymentPeriodLabel: insertPayment.paymentPeriodLabel ?? null,
      primeRate: insertPayment.primeRate ?? null,
      triggerRateHit: insertPayment.triggerRateHit ?? 0,
      id, 
      createdAt: new Date() 
    };
    this.mortgagePayments.set(id, payment);
    return payment;
  }
  
  // Scenarios
  async getScenario(id: string): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }
  
  async getScenariosByUser(userId: string): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(s => s.userId === userId);
  }
  
  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const id = randomUUID();
    const scenario: Scenario = { 
      ...insertScenario,
      description: insertScenario.description ?? null,
      prepaymentMonthlyPercent: insertScenario.prepaymentMonthlyPercent ?? 50,
      investmentMonthlyPercent: insertScenario.investmentMonthlyPercent ?? 50,
      expectedReturnRate: insertScenario.expectedReturnRate ?? "6.000",
      efPriorityPercent: insertScenario.efPriorityPercent ?? 0, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.scenarios.set(id, scenario);
    return scenario;
  }
  
  async updateScenario(id: string, update: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const existing = this.scenarios.get(id);
    if (!existing) return undefined;
    
    const updated: Scenario = { 
      ...existing, 
      ...update, 
      updatedAt: new Date() 
    };
    this.scenarios.set(id, updated);
    return updated;
  }
  
  async deleteScenario(id: string): Promise<boolean> {
    // Cascade delete: remove associated prepayment events
    const events = await this.getPrepaymentEventsByScenario(id);
    for (const event of events) {
      this.prepaymentEvents.delete(event.id);
    }
    
    return this.scenarios.delete(id);
  }
  
  // Prepayment Events
  async getPrepaymentEvent(id: string): Promise<PrepaymentEvent | undefined> {
    return this.prepaymentEvents.get(id);
  }
  
  async getPrepaymentEventsByScenario(scenarioId: string): Promise<PrepaymentEvent[]> {
    return Array.from(this.prepaymentEvents.values()).filter(e => e.scenarioId === scenarioId);
  }
  
  async createPrepaymentEvent(insertEvent: InsertPrepaymentEvent): Promise<PrepaymentEvent> {
    const id = randomUUID();
    const event: PrepaymentEvent = { 
      description: null,
      startPaymentNumber: 1,
      recurrenceMonth: null,
      oneTimeYear: null,
      ...insertEvent, 
      id, 
      createdAt: new Date() 
    };
    this.prepaymentEvents.set(id, event);
    return event;
  }
  
  async updatePrepaymentEvent(id: string, update: Partial<InsertPrepaymentEvent>): Promise<PrepaymentEvent | undefined> {
    const existing = this.prepaymentEvents.get(id);
    if (!existing) return undefined;
    
    const updated: PrepaymentEvent = { ...existing, ...update };
    this.prepaymentEvents.set(id, updated);
    return updated;
  }
  
  async deletePrepaymentEvent(id: string): Promise<boolean> {
    return this.prepaymentEvents.delete(id);
  }
}

export class DBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Cash Flow
  async getCashFlow(userId: string): Promise<CashFlow | undefined> {
    const result = await db.select().from(cashFlow).where(eq(cashFlow.userId, userId));
    return result[0];
  }

  async createCashFlow(insertCashFlow: InsertCashFlow): Promise<CashFlow> {
    const result = await db.insert(cashFlow).values(insertCashFlow).returning();
    return result[0];
  }

  async updateCashFlow(id: string, update: Partial<InsertCashFlow>): Promise<CashFlow | undefined> {
    const result = await db.update(cashFlow).set(update).where(eq(cashFlow.id, id)).returning();
    return result[0];
  }

  // Emergency Fund
  async getEmergencyFund(userId: string): Promise<EmergencyFund | undefined> {
    const result = await db.select().from(emergencyFund).where(eq(emergencyFund.userId, userId));
    return result[0];
  }

  async createEmergencyFund(insertEF: InsertEmergencyFund): Promise<EmergencyFund> {
    const result = await db.insert(emergencyFund).values(insertEF).returning();
    return result[0];
  }

  async updateEmergencyFund(id: string, update: Partial<InsertEmergencyFund>): Promise<EmergencyFund | undefined> {
    const result = await db.update(emergencyFund).set(update).where(eq(emergencyFund.id, id)).returning();
    return result[0];
  }

  // Mortgages
  async getMortgage(id: string): Promise<Mortgage | undefined> {
    const result = await db.select().from(mortgages).where(eq(mortgages.id, id));
    return result[0];
  }

  async getMortgagesByUser(userId: string): Promise<Mortgage[]> {
    return db.select().from(mortgages).where(eq(mortgages.userId, userId));
  }

  async createMortgage(insertMortgage: InsertMortgage): Promise<Mortgage> {
    const result = await db.insert(mortgages).values(insertMortgage).returning();
    return result[0];
  }

  async updateMortgage(id: string, update: Partial<InsertMortgage>): Promise<Mortgage | undefined> {
    const result = await db.update(mortgages).set(update).where(eq(mortgages.id, id)).returning();
    return result[0];
  }

  async deleteMortgage(id: string): Promise<boolean> {
    const result = await db.delete(mortgages).where(eq(mortgages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Mortgage Terms
  async getMortgageTerm(id: string): Promise<MortgageTerm | undefined> {
    const result = await db.select().from(mortgageTerms).where(eq(mortgageTerms.id, id));
    return result[0];
  }

  async getMortgageTermsByMortgage(mortgageId: string): Promise<MortgageTerm[]> {
    return db.select().from(mortgageTerms).where(eq(mortgageTerms.mortgageId, mortgageId));
  }

  async createMortgageTerm(insertTerm: InsertMortgageTerm): Promise<MortgageTerm> {
    const result = await db.insert(mortgageTerms).values(insertTerm).returning();
    return result[0];
  }

  async updateMortgageTerm(id: string, update: Partial<InsertMortgageTerm>): Promise<MortgageTerm | undefined> {
    const result = await db.update(mortgageTerms).set(update).where(eq(mortgageTerms.id, id)).returning();
    return result[0];
  }

  async deleteMortgageTerm(id: string): Promise<boolean> {
    const result = await db.delete(mortgageTerms).where(eq(mortgageTerms.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Mortgage Payments
  async getMortgagePayment(id: string): Promise<MortgagePayment | undefined> {
    const result = await db.select().from(mortgagePayments).where(eq(mortgagePayments.id, id));
    return result[0];
  }

  async getMortgagePaymentsByMortgage(mortgageId: string): Promise<MortgagePayment[]> {
    return db.select().from(mortgagePayments).where(eq(mortgagePayments.mortgageId, mortgageId));
  }

  async getMortgagePaymentsByTerm(termId: string): Promise<MortgagePayment[]> {
    return db.select().from(mortgagePayments).where(eq(mortgagePayments.termId, termId));
  }

  async createMortgagePayment(insertPayment: InsertMortgagePayment): Promise<MortgagePayment> {
    const result = await db.insert(mortgagePayments).values(insertPayment).returning();
    return result[0];
  }

  // Scenarios
  async getScenario(id: string): Promise<Scenario | undefined> {
    const result = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return result[0];
  }

  async getScenariosByUser(userId: string): Promise<Scenario[]> {
    return db.select().from(scenarios).where(eq(scenarios.userId, userId));
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const result = await db.insert(scenarios).values(insertScenario).returning();
    return result[0];
  }

  async updateScenario(id: string, update: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const result = await db.update(scenarios).set(update).where(eq(scenarios.id, id)).returning();
    return result[0];
  }

  async deleteScenario(id: string): Promise<boolean> {
    const result = await db.delete(scenarios).where(eq(scenarios.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Prepayment Events
  async getPrepaymentEvent(id: string): Promise<PrepaymentEvent | undefined> {
    const result = await db.select().from(prepaymentEvents).where(eq(prepaymentEvents.id, id));
    return result[0];
  }

  async getPrepaymentEventsByScenario(scenarioId: string): Promise<PrepaymentEvent[]> {
    return db.select().from(prepaymentEvents).where(eq(prepaymentEvents.scenarioId, scenarioId));
  }

  async createPrepaymentEvent(insertEvent: InsertPrepaymentEvent): Promise<PrepaymentEvent> {
    const result = await db.insert(prepaymentEvents).values(insertEvent).returning();
    return result[0];
  }

  async updatePrepaymentEvent(id: string, update: Partial<InsertPrepaymentEvent>): Promise<PrepaymentEvent | undefined> {
    const result = await db.update(prepaymentEvents).set(update).where(eq(prepaymentEvents.id, id)).returning();
    return result[0];
  }

  async deletePrepaymentEvent(id: string): Promise<boolean> {
    const result = await db.delete(prepaymentEvents).where(eq(prepaymentEvents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DBStorage();
