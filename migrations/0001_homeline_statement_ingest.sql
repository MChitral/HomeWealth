ALTER TABLE "mortgage_payments" ADD COLUMN "is_missed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "mortgage_payments" ADD COLUMN "statement_period" varchar(7);--> statement-breakpoint
CREATE UNIQUE INDEX "UQ_mortgage_payments_statement_period" ON "mortgage_payments" ("mortgage_id","statement_period") WHERE "mortgage_payments"."calculation_source" = 'statement' AND "mortgage_payments"."statement_period" IS NOT NULL;--> statement-breakpoint
CREATE TABLE "staged_imports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mortgage_id" varchar NOT NULL,
	"document_type" text NOT NULL,
	"statement_period" varchar(7) NOT NULL,
	"status" text DEFAULT 'staged' NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"template_id" text NOT NULL,
	"extractor_version" text NOT NULL,
	"facts" jsonb NOT NULL,
	"proof_results" jsonb,
	"payment_id" varchar,
	"superseded_by_id" varchar,
	"expires_at" timestamp NOT NULL,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "IDX_staged_imports_mortgage_status" ON "staged_imports" ("mortgage_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "UQ_staged_imports_active_confirmed" ON "staged_imports" ("user_id","mortgage_id","document_type","statement_period") WHERE "staged_imports"."status" = 'confirmed';--> statement-breakpoint
CREATE TABLE "privilege_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mortgage_id" varchar NOT NULL,
	"staged_import_id" varchar NOT NULL,
	"payment_id" varchar,
	"privilege_type" text NOT NULL,
	"event_date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"consumes_lump_sum_limit" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "IDX_privilege_events_mortgage" ON "privilege_events" ("mortgage_id","event_date");--> statement-breakpoint
CREATE TABLE "facility_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mortgage_id" varchar NOT NULL,
	"staged_import_id" varchar NOT NULL,
	"statement_period" varchar(7) NOT NULL,
	"statement_as_of" date NOT NULL,
	"mortgage_outstanding" numeric(12, 2) NOT NULL,
	"heloc_limit" numeric(12, 2),
	"heloc_drawn" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"available_credit" numeric(12, 2) NOT NULL,
	"plan_total_limit" numeric(12, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "UQ_facility_snapshots_active_period" ON "facility_snapshots" ("mortgage_id","statement_period") WHERE "facility_snapshots"."status" = 'active';--> statement-breakpoint
CREATE TABLE "lender_projection_locks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mortgage_id" varchar NOT NULL,
	"staged_import_id" varchar NOT NULL,
	"statement_period" varchar(7) NOT NULL,
	"interest_to_end_of_term" numeric(12, 2) NOT NULL,
	"principal_and_interest_to_end_of_term" numeric(12, 2),
	"triggering_annual_rate" numeric(6, 3),
	"next_due_date" date,
	"rate_reduction" numeric(6, 3),
	"remaining_term" text,
	"remaining_amortization" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "IDX_lender_projection_locks_mortgage" ON "lender_projection_locks" ("mortgage_id","statement_period");--> statement-breakpoint
CREATE TABLE "rules_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mortgage_id" varchar NOT NULL,
	"staged_import_id" varchar NOT NULL,
	"statement_period" varchar(7) NOT NULL,
	"statement_as_of" date NOT NULL,
	"interest_adjustment_date" date,
	"annual_lump_sum_limit_amount" numeric(12, 2),
	"annual_lump_sum_limit_percent" integer,
	"skip_a_payment_ytd" numeric(12, 2),
	"interest_in_arrears" numeric(12, 2),
	"accrued_interest" numeric(12, 2),
	"penalty_method" text,
	"switch_out_fee" numeric(12, 2),
	"discharge_fee" numeric(12, 2),
	"loan_protector_per_thousand" numeric(8, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "IDX_rules_snapshots_mortgage" ON "rules_snapshots" ("mortgage_id","statement_period");--> statement-breakpoint
ALTER TABLE "staged_imports" ADD CONSTRAINT "staged_imports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_imports" ADD CONSTRAINT "staged_imports_mortgage_id_mortgages_id_fk" FOREIGN KEY ("mortgage_id") REFERENCES "mortgages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privilege_events" ADD CONSTRAINT "privilege_events_mortgage_id_mortgages_id_fk" FOREIGN KEY ("mortgage_id") REFERENCES "mortgages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privilege_events" ADD CONSTRAINT "privilege_events_staged_import_id_staged_imports_id_fk" FOREIGN KEY ("staged_import_id") REFERENCES "staged_imports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_snapshots" ADD CONSTRAINT "facility_snapshots_mortgage_id_mortgages_id_fk" FOREIGN KEY ("mortgage_id") REFERENCES "mortgages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_snapshots" ADD CONSTRAINT "facility_snapshots_staged_import_id_staged_imports_id_fk" FOREIGN KEY ("staged_import_id") REFERENCES "staged_imports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_projection_locks" ADD CONSTRAINT "lender_projection_locks_mortgage_id_mortgages_id_fk" FOREIGN KEY ("mortgage_id") REFERENCES "mortgages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_projection_locks" ADD CONSTRAINT "lender_projection_locks_staged_import_id_staged_imports_id_fk" FOREIGN KEY ("staged_import_id") REFERENCES "staged_imports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules_snapshots" ADD CONSTRAINT "rules_snapshots_mortgage_id_mortgages_id_fk" FOREIGN KEY ("mortgage_id") REFERENCES "mortgages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules_snapshots" ADD CONSTRAINT "rules_snapshots_staged_import_id_staged_imports_id_fk" FOREIGN KEY ("staged_import_id") REFERENCES "staged_imports"("id") ON DELETE no action ON UPDATE no action;
