CREATE TABLE "cash_flow" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"monthly_income" numeric(10, 2) NOT NULL,
	"extra_paycheques" integer DEFAULT 2 NOT NULL,
	"annual_bonus" numeric(10, 2) DEFAULT '0' NOT NULL,
	"property_tax" numeric(10, 2) DEFAULT '0' NOT NULL,
	"home_insurance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"condo_fees" numeric(10, 2) DEFAULT '0' NOT NULL,
	"utilities" numeric(10, 2) DEFAULT '0' NOT NULL,
	"groceries" numeric(10, 2) DEFAULT '0' NOT NULL,
	"dining" numeric(10, 2) DEFAULT '0' NOT NULL,
	"transportation" numeric(10, 2) DEFAULT '0' NOT NULL,
	"entertainment" numeric(10, 2) DEFAULT '0' NOT NULL,
	"car_loan" numeric(10, 2) DEFAULT '0' NOT NULL,
	"student_loan" numeric(10, 2) DEFAULT '0' NOT NULL,
	"credit_card" numeric(10, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emergency_fund" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"target_months" integer DEFAULT 6 NOT NULL,
	"current_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"monthly_contribution" numeric(10, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mortgage_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mortgage_id" varchar NOT NULL,
	"term_id" varchar NOT NULL,
	"payment_date" date NOT NULL,
	"payment_period_label" text,
	"regular_payment_amount" numeric(10, 2) NOT NULL,
	"prepayment_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"payment_amount" numeric(10, 2) NOT NULL,
	"principal_paid" numeric(10, 2) NOT NULL,
	"interest_paid" numeric(10, 2) NOT NULL,
	"remaining_balance" numeric(12, 2) NOT NULL,
	"prime_rate" numeric(5, 3),
	"effective_rate" numeric(5, 3) NOT NULL,
	"trigger_rate_hit" integer DEFAULT 0 NOT NULL,
	"is_skipped" integer DEFAULT 0 NOT NULL,
	"skipped_interest_accrued" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"remaining_amortization_months" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mortgage_terms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mortgage_id" varchar NOT NULL,
	"term_type" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"term_years" integer NOT NULL,
	"fixed_rate" numeric(5, 3),
	"locked_spread" numeric(5, 3),
	"prime_rate" numeric(5, 3),
	"payment_frequency" text NOT NULL,
	"regular_payment_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mortgages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_price" numeric(12, 2) NOT NULL,
	"down_payment" numeric(12, 2) NOT NULL,
	"original_amount" numeric(12, 2) NOT NULL,
	"current_balance" numeric(12, 2) NOT NULL,
	"start_date" date NOT NULL,
	"amortization_years" integer NOT NULL,
	"amortization_months" integer DEFAULT 0 NOT NULL,
	"payment_frequency" text NOT NULL,
	"annual_prepayment_limit_percent" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prepayment_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"start_payment_number" integer DEFAULT 1 NOT NULL,
	"recurrence_month" integer,
	"one_time_year" integer,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prime_rate_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prime_rate" numeric(5, 3) NOT NULL,
	"effective_date" date NOT NULL,
	"source" text DEFAULT 'Bank of Canada' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refinancing_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"refinancing_year" integer,
	"at_term_end" integer DEFAULT 0 NOT NULL,
	"new_rate" numeric(5, 3) NOT NULL,
	"term_type" text NOT NULL,
	"new_amortization_months" integer,
	"payment_frequency" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"prepayment_monthly_percent" integer DEFAULT 50 NOT NULL,
	"investment_monthly_percent" integer DEFAULT 50 NOT NULL,
	"expected_return_rate" numeric(5, 3) DEFAULT '6.000' NOT NULL,
	"ef_priority_percent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cash_flow" ADD CONSTRAINT "cash_flow_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_fund" ADD CONSTRAINT "emergency_fund_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mortgage_payments" ADD CONSTRAINT "mortgage_payments_mortgage_id_mortgages_id_fk" FOREIGN KEY ("mortgage_id") REFERENCES "public"."mortgages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mortgage_payments" ADD CONSTRAINT "mortgage_payments_term_id_mortgage_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."mortgage_terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mortgage_terms" ADD CONSTRAINT "mortgage_terms_mortgage_id_mortgages_id_fk" FOREIGN KEY ("mortgage_id") REFERENCES "public"."mortgages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mortgages" ADD CONSTRAINT "mortgages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prepayment_events" ADD CONSTRAINT "prepayment_events_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refinancing_events" ADD CONSTRAINT "refinancing_events_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_prime_rate_effective_date" ON "prime_rate_history" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "IDX_prime_rate_created_at" ON "prime_rate_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");