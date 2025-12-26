# Competitive Analysis: ProjectionLab & LunchMoney

**Date:** January 2025  
**Purpose:** Comprehensive competitive analysis of ProjectionLab and LunchMoney vs. our Canadian Mortgage Strategy & Wealth Forecasting application  
**Audience:** Product Team, Stakeholders, Development Team  
**Status:** Strategic Analysis Document - Competitive Intelligence

> **Note:** This competitive analysis provides strategic positioning insights. The competitive landscape should be reviewed periodically as market conditions and competitor features evolve.

---

## Executive Summary

This analysis evaluates two potential competitors in the personal finance space:

1. **ProjectionLab** - Financial planning and retirement simulation platform
2. **LunchMoney** - Budgeting and expense tracking application

**Key Finding:** Both products serve different market segments than our mortgage-focused application, but there is **indirect competition** in the financial planning space. Neither product specializes in Canadian mortgage optimization, which is our core differentiator.

---

## 1. ProjectionLab Analysis

### Product Overview

**Website:** [projectionlab.com](https://projectionlab.com/)  
**Positioning:** "Build Financial Plans You Love" - Financial planning software for simulating financial future

### Core Value Proposition

- Simulate financial future and chart course toward goals
- Visualize whole life's finances
- Monte Carlo simulations for retirement planning
- Privacy-focused (no bank account linking)

### Key Features

#### 1. Financial Planning & Simulations

- **Life Milestones:** Define personal milestones (FI, retirement, etc.)
- **Monte Carlo Simulations:** Gauge chance of success with probabilistic modeling
- **Scenario Planning:** Test different investment strategies, account types, contribution orders
- **Historical Backtesting:** Test against historical market data
- **Tax Planning:** Detailed tax estimation and analytics
- **Cash Flow Visualization:** Sankey diagrams for cash flow analysis

#### 2. Account & Asset Modeling

- **Multiple Account Types:** Traditional, Roth, 401(k), etc.
- **Real Assets:** Real estate, rental income modeling
- **Debt Tracking:** Student loans, mortgages (basic)
- **Portfolio Blends:** Different investment strategies over time

#### 3. International Support

- **Multi-Currency:** Choose display currency
- **International Tax Presets:** Canada, UK, Australia, Germany, Netherlands, etc.
- **International Account Types:** Country-specific account types

#### 4. Privacy & Data Control

- **No Bank Linking:** Explicitly does NOT connect to financial accounts
- **Data Storage Options:**
  - Cloud sync via Google Firebase
  - Browser localStorage only
  - Manual import/export to flat files
- **Privacy-First:** "You are not the product"

#### 5. Progress Tracking

- **Journal Feature:** Track actual progress over time
- **Comparison:** Compare actual vs. initial projections
- **Visualization:** Historical net worth, assets, liabilities

### Pricing Model

**Free Tier:**

- Ad-hoc retirement projections
- No data persistence
- Limited features

**Premium:**

- **Monthly:** $14/month
- **Annual:** $109/year (saves $59/year)
- **Lifetime:** $799 one-time
- **Features:** Data persistence, tax estimation, advanced visualizations

**Pro (Advisors):**

- **Monthly:** $70/month
- **Annual:** $540/year
- **Features:** Multi-client management, advisor-specific tools

### Target Audience

- **Primary:** FIRE (Financial Independence, Retire Early) community
- **Secondary:** Retirement planners, financial independence seekers
- **Tertiary:** Financial advisors (Pro version)

### Strengths

1. **Comprehensive Financial Modeling:** Very detailed, sophisticated planning
2. **Privacy-Focused:** No bank linking appeals to privacy-conscious users
3. **Visual Excellence:** Beautiful, intuitive interface
4. **Monte Carlo Simulations:** Advanced probabilistic modeling
5. **International Support:** Multi-country tax and account support
6. **Strong Community:** Active Discord, testimonials from FIRE influencers

### Weaknesses

1. **No Bank Integration:** Manual data entry required
2. **Mortgage Focus:** Basic mortgage modeling, not specialized
3. **Canadian Mortgage Specificity:** Limited Canadian mortgage-specific features
4. **Complexity:** May be overwhelming for casual users
5. **No Real-Time Monitoring:** Static planning tool, not monitoring platform

### Competitive Threat Level: **MEDIUM**

**Why:**

- Overlaps with our scenario planning and wealth forecasting
- Targets similar users (financial planning, retirement)
- Strong brand in FIRE community
- **BUT:** Not mortgage-focused, no Canadian mortgage specialization, no monitoring/alerts

---

## 2. LunchMoney Analysis

### Product Overview

**Website:** [lunchmoney.app](https://lunchmoney.app/)  
**Positioning:** Budgeting and personal finance management for modern-day spenders

### Core Value Proposition

- Daily budgeting and expense tracking
- Transaction import and categorization
- Net worth tracking
- Multi-currency and crypto support

### Key Features

#### 1. Transaction Management

- **Bank Syncing:** Connect bank accounts (multiple countries)
- **CSV Import:** Manual file upload
- **Developer API:** Programmatic access
- **Manual Entry:** Manual transaction input
- **Multi-Currency:** Track multiple currencies, consolidated view

#### 2. Budgeting & Categorization

- **Automated Rules Engine:** Auto-categorize transactions
- **Custom Categories:** User-defined categories
- **Budget Tracking:** Set and track budgets
- **Spending Analysis:** Visual spending breakdowns

#### 3. Asset Tracking

- **Net Worth Tracking:** Overall financial picture
- **Crypto Portfolio:** Cryptocurrency tracking
- **Asset Management:** Track various asset types

#### 4. Automation

- **Rules Engine:** Automate categorization and tasks
- **Recurring Transactions:** Handle recurring income/expenses
- **Smart Categorization:** AI-powered transaction categorization

#### 5. International Support

- **Bank Syncing Countries:** Belgium, Canada, Denmark, France, Germany, Ireland, Italy, Netherlands, Norway, Poland, Portugal, Spain, Sweden, US
- **Multi-Currency:** Support for multiple currencies

### Pricing Model

**Monthly Subscription:**

- **Price:** $10/month
- **Includes:** All product features, Discord community access, beta testing

**Annual Subscription (Pay-What-You-Want):**

- **Minimum:** $50/year
- **Maximum:** $150/year
- **User-Determined:** Users choose their price
- **Philosophy:** Accessibility over profit maximization

**No Free Tier:**

- Trial available
- No permanent free plan

### Target Audience

- **Primary:** Budget-conscious individuals, expense trackers
- **Secondary:** People who want bank syncing without ads
- **Tertiary:** International users, crypto holders

### Strengths

1. **Bank Integration:** Actual bank account syncing (unlike ProjectionLab)
2. **Privacy-Focused:** No ads, no data selling
3. **Multi-Currency:** Strong international support
4. **Crypto Support:** Unique feature for crypto portfolio tracking
5. **User-Centric Pricing:** Pay-what-you-want annual model
6. **Automation:** Strong rules engine and automation

### Weaknesses

1. **No Free Plan:** Only trial, no permanent free tier
2. **Limited Investment Tracking:** Basic, focused on crypto
3. **No Financial Planning:** No retirement planning, scenario modeling
4. **No Mortgage Focus:** No mortgage-specific features
5. **Budgeting-Focused:** Not a planning tool, more of a tracking tool

### Competitive Threat Level: **LOW**

**Why:**

- Different use case (budgeting vs. mortgage planning)
- No mortgage-specific features
- No financial planning/scenario modeling
- **BUT:** Could compete for user attention/time, has bank integration we're considering

---

## 3. Comparative Analysis: Our Product vs. Competitors

### Feature Comparison Matrix

| Feature Category                   | Our Product                       | ProjectionLab        | LunchMoney           |
| ---------------------------------- | --------------------------------- | -------------------- | -------------------- |
| **Mortgage Tracking**              | ✅ Comprehensive                  | ⚠️ Basic             | ❌ None              |
| **Canadian Mortgage Calculations** | ✅ Full (semi-annual compounding) | ⚠️ Basic             | ❌ None              |
| **VRM Trigger Rate Modeling**      | ✅ Advanced                       | ❌ None              | ❌ None              |
| **Scenario Planning**              | ✅ Prepayment vs Investment       | ✅ Comprehensive     | ❌ None              |
| **Wealth Forecasting**             | ✅ 10/20/30 year                  | ✅ Lifetime          | ⚠️ Basic             |
| **Bank Integration**               | ❌ Not yet                        | ❌ Explicitly avoids | ✅ Full              |
| **Prime Rate Tracking**            | ✅ Automated (BoC)                | ❌ None              | ❌ None              |
| **Renewal Planning**               | ✅ Planned                        | ❌ None              | ❌ None              |
| **Trigger Rate Alerts**            | ✅ Planned                        | ❌ None              | ❌ None              |
| **Tax Planning**                   | ❌ None                           | ✅ Advanced          | ❌ None              |
| **Monte Carlo Simulations**        | ❌ None                           | ✅ Full              | ❌ None              |
| **Budgeting**                      | ⚠️ Basic (cash flow)              | ❌ None              | ✅ Comprehensive     |
| **Transaction Tracking**           | ❌ None                           | ❌ None              | ✅ Full              |
| **Multi-Currency**                 | ❌ None                           | ✅ Yes               | ✅ Yes               |
| **International Support**          | ⚠️ Canada-focused                 | ✅ Multi-country     | ✅ Multi-country     |
| **Privacy Focus**                  | ✅ No bank linking                | ✅ Explicit          | ✅ No ads            |
| **Pricing**                        | ⚠️ TBD                            | $14/mo or $109/yr    | $10/mo or $50-150/yr |

### Target Audience Overlap

**Our Product:**

- Canadian homeowners with mortgages
- First-time homebuyers
- Existing homeowners (refinancing/prepayment)
- Financial planners (Canadian mortgage focus)

**ProjectionLab:**

- FIRE community
- Retirement planners
- Financial independence seekers
- Financial advisors

**LunchMoney:**

- Budget-conscious individuals
- Expense trackers
- International users
- Crypto holders

**Overlap Analysis:**

- **Direct Overlap:** Low (different primary use cases)
- **Indirect Overlap:** Medium (all serve personal finance market)
- **User Time Competition:** High (competing for user attention)

### Pricing Comparison

| Product           | Free Tier     | Monthly      | Annual                | Lifetime | Notes                |
| ----------------- | ------------- | ------------ | --------------------- | -------- | -------------------- |
| **Our Product**   | TBD           | TBD ($9.99?) | TBD ($99?)            | TBD      | Not yet launched     |
| **ProjectionLab** | ✅ Limited    | $14          | $109                  | $799     | Well-established     |
| **LunchMoney**    | ❌ Trial only | $10          | $50-150 (user choice) | ❌       | Unique pricing model |

**Pricing Insights:**

- ProjectionLab: Premium pricing ($14/mo) for comprehensive planning
- LunchMoney: Lower pricing ($10/mo) for budgeting focus
- Our positioning: Should be between $9-12/mo for mortgage monitoring

---

## 4. Competitive Threats & Opportunities

### Threats

#### From ProjectionLab

**1. Feature Overlap**

- **Threat:** Scenario planning, wealth forecasting overlap
- **Impact:** Users might choose ProjectionLab for comprehensive planning
- **Mitigation:** Emphasize mortgage specialization, Canadian focus

**2. Brand Strength**

- **Threat:** Strong brand in FIRE community, influencer endorsements
- **Impact:** Higher brand awareness, user trust
- **Mitigation:** Focus on mortgage-specific messaging, Canadian market

**3. Advanced Features**

- **Threat:** Monte Carlo simulations, tax planning, advanced visualizations
- **Impact:** More sophisticated planning capabilities
- **Mitigation:** Mortgage-specific features they don't have (trigger rates, renewal planning)

#### From LunchMoney

**1. Bank Integration**

- **Threat:** They have bank syncing, we don't (yet)
- **Impact:** Easier data entry, better user experience
- **Mitigation:** Our manual import plan, focus on mortgage value not budgeting

**2. Lower Pricing**

- **Threat:** $10/mo vs. our potential $9.99/mo
- **Impact:** Price competition
- **Mitigation:** Different value proposition (mortgage monitoring vs. budgeting)

**3. User Attention**

- **Threat:** Competing for user time/attention
- **Impact:** Users might choose budgeting over mortgage planning
- **Mitigation:** Emphasize mortgage is biggest expense, high ROI on optimization

### Opportunities

#### 1. Mortgage Specialization

- **Opportunity:** Neither competitor specializes in mortgages
- **Action:** Double down on mortgage-specific features
- **Value:** Unique positioning in market

#### 2. Canadian Market Focus

- **Opportunity:** Both are US-focused (though ProjectionLab has international support)
- **Action:** Deep Canadian mortgage expertise
- **Value:** Less competition in Canadian market

#### 3. Monitoring vs. Planning

- **Opportunity:** ProjectionLab is planning tool, we're becoming monitoring tool
- **Action:** Emphasize ongoing monitoring, alerts, proactive insights
- **Value:** Different use case, complementary not competitive

#### 4. Integration Opportunity

- **Opportunity:** Could integrate with ProjectionLab (export data)
- **Action:** Consider API/export features for integration
- **Value:** Complementary tools, not competitors

#### 5. Lower Barrier to Entry

- **Opportunity:** ProjectionLab is complex, LunchMoney is budgeting-focused
- **Action:** Position as "mortgage planning made simple"
- **Value:** Easier onboarding, focused value proposition

---

## 5. Strategic Recommendations

### Positioning Strategy

**Primary Positioning:**
"The only Canadian mortgage health monitoring platform"

**Key Messages:**

1. **Specialization:** "We do mortgages, and we do them better"
2. **Canadian Expertise:** "Built for Canadian mortgages (semi-annual compounding, trigger rates)"
3. **Monitoring Focus:** "Not just planning, but ongoing monitoring and alerts"
4. **Complementary:** "Works alongside your other financial tools"

### Feature Differentiation

**Must-Have Differentiators:**

1. ✅ **Canadian Mortgage Calculations** (semi-annual compounding)
2. ✅ **VRM Trigger Rate Modeling** (unique in market)
3. ✅ **Renewal Planning & Alerts** (time-sensitive, high-value)
4. ✅ **Prime Rate Tracking** (automated, Canadian-specific)
5. ✅ **Prepayment Opportunity Detection** (mortgage-specific)

**Nice-to-Have Differentiators:**

1. **Mortgage Penalty Calculator** (IRD, 3-month interest)
2. **Blend-and-Extend UI** (renewal option)
3. **Mortgage Health Score** (gamification)

### Pricing Strategy

**Recommended Pricing:**

- **Free Tier:** Basic calculator, 1 scenario, no alerts
- **Premium:** $9.99/month or $99/year
  - All monitoring features
  - Unlimited scenarios
  - All alerts and insights

**Rationale:**

- Lower than ProjectionLab ($14/mo) - different use case
- Similar to LunchMoney ($10/mo) - but mortgage-focused value
- Annual discount (17% off) to match industry standard

### Go-to-Market Strategy

**1. Target Canadian Market First**

- Focus on Canadian homeowners
- Emphasize Canadian mortgage expertise
- Less competition in Canadian market

**2. Mortgage-Focused Messaging**

- "Optimize your biggest expense"
- "Never miss a renewal opportunity"
- "Protect against trigger rate risks"

**3. Complementary Positioning**

- "Works with ProjectionLab" (export data)
- "Focus on mortgages, not budgeting" (vs. LunchMoney)
- "Mortgage monitoring, not just planning" (vs. ProjectionLab)

### Feature Roadmap Priorities

**Phase 1 (Q1 2026):** Build monitoring foundation

- Alert system
- Renewal planning
- Trigger rate monitoring
- **Why:** Differentiates from ProjectionLab (planning) and LunchMoney (budgeting)

**Phase 2 (Q2 2026):** Proactive insights

- Prime rate change alerts
- Prepayment opportunities
- Refinancing analysis
- **Why:** Ongoing value, not one-time planning

**Phase 3 (Q3 2026):** Advanced features

- Mortgage health score
- Advanced analytics
- Market rate tracking
- **Why:** Deepen engagement, reduce churn

**Defer:** Bank integration (validate demand first)

---

## 6. Competitive Intelligence Summary

### ProjectionLab: Indirect Competitor

**Competitive Position:** MEDIUM threat

- **Overlap:** Scenario planning, wealth forecasting
- **Differentiation:** We're mortgage-focused, they're general planning
- **Action:** Emphasize mortgage specialization, Canadian focus

**Key Learnings:**

1. Privacy-focused approach resonates (no bank linking)
2. Premium pricing ($14/mo) works for comprehensive planning
3. Community and influencer marketing is effective
4. International support expands market

### LunchMoney: Indirect Competitor

**Competitive Position:** LOW threat

- **Overlap:** Minimal (different use cases)
- **Differentiation:** We're mortgage planning, they're budgeting
- **Action:** Focus on mortgage value, not budgeting

**Key Learnings:**

1. Bank integration is valuable but complex
2. Lower pricing ($10/mo) for focused tools
3. Pay-what-you-want model is unique
4. International bank support is important

### Our Competitive Advantages

1. **Mortgage Specialization:** Deep expertise in Canadian mortgages
2. **Monitoring Focus:** Ongoing value, not one-time planning
3. **Canadian Market:** Less competition, more focused
4. **Unique Features:** Trigger rates, renewal planning, prime rate tracking
5. **Complementary:** Works with other tools, not replacement

### Our Competitive Disadvantages

1. **Brand Awareness:** New product vs. established competitors
2. **Feature Breadth:** Less comprehensive than ProjectionLab
3. **Bank Integration:** Not yet available (LunchMoney has it)
4. **Community:** No established community yet
5. **Pricing:** Not yet validated

---

## 7. Action Items

### Immediate (Next 3 Months)

1. **Complete Monitoring Foundation**
   - Alert system
   - Renewal planning
   - Trigger rate monitoring
   - **Why:** Differentiates from competitors

2. **Positioning Documentation**
   - Create messaging framework
   - Define competitive positioning
   - Develop marketing materials
   - **Why:** Clear differentiation needed

3. **Pricing Validation**
   - User research on pricing
   - Competitive pricing analysis
   - Value proposition testing
   - **Why:** Need to validate pricing strategy

### Short Term (3-6 Months)

4. **Canadian Market Focus**
   - Canadian-specific marketing
   - Canadian mortgage content
   - Canadian user acquisition
   - **Why:** Less competition, better fit

5. **Feature Differentiation**
   - Mortgage penalty calculator
   - Blend-and-extend UI
   - Mortgage health score
   - **Why:** Unique features competitors don't have

### Medium Term (6-12 Months)

6. **Community Building**
   - Build user community
   - Content marketing
   - Influencer partnerships
   - **Why:** ProjectionLab shows community value

7. **Integration Opportunities**
   - Export to ProjectionLab format
   - API for integrations
   - Data portability
   - **Why:** Complementary positioning

---

## 8. Additional Competitors to Monitor

### Canadian Mortgage-Specific Tools

**Research Finding:** Limited direct Canadian mortgage-specific competitors found in current market research. This represents both an **opportunity** (less competition) and a **risk** (market validation needed).

#### Potential Competitors to Watch:

**1. Bank Mortgage Calculators**

- **Examples:** RBC, TD, BMO, Scotiabank, CIBC mortgage calculators
- **Threat Level:** LOW (basic calculators, no monitoring)
- **Differentiation:** We offer advanced features, monitoring, scenario planning
- **Action:** Monitor for feature additions, especially renewal planning tools

**2. Rate Comparison Sites**

- **Examples:** Ratehub, RateSupermarket, CanWise
- **Threat Level:** LOW (focus on rate comparison, not optimization)
- **Differentiation:** We focus on optimization and monitoring, not just rate shopping
- **Action:** Monitor for expansion into mortgage management features

**3. Canadian Fintech Apps**

- **Examples:** Wealthsimple, Questrade, Mylo (if they add mortgage features)
- **Threat Level:** MEDIUM (if they expand into mortgages)
- **Differentiation:** We're mortgage-specialized, they're general financial
- **Action:** Monitor product roadmaps, feature announcements

**4. Real Estate Platforms**

- **Examples:** Realtor.ca, Zillow Canada (if they add mortgage tools)
- **Threat Level:** LOW (focus on listings, not mortgage optimization)
- **Differentiation:** We're post-purchase optimization, they're pre-purchase
- **Action:** Monitor for mortgage management feature additions

### Indirect Competitors (General Financial Planning)

**1. YNAB (You Need A Budget)**

- **Focus:** Budgeting and expense tracking
- **Threat Level:** LOW (different use case)
- **Differentiation:** We're mortgage optimization, they're budgeting
- **Action:** Monitor for mortgage-specific feature additions

**2. Personal Capital / Empower**

- **Focus:** Investment tracking and retirement planning
- **Threat Level:** LOW (US-focused, investment focus)
- **Differentiation:** We're Canadian mortgage-focused, they're US investment-focused
- **Action:** Monitor for Canadian expansion, mortgage features

**3. Mint (Discontinued) / Credit Karma**

- **Focus:** Credit monitoring and budgeting
- **Threat Level:** LOW (budgeting focus, no mortgage optimization)
- **Differentiation:** We're mortgage-specialized, they're general financial
- **Action:** Monitor Credit Karma for mortgage feature additions

**4. Spreadsheet Solutions**

- **Examples:** Excel templates, Google Sheets mortgage calculators
- **Threat Level:** LOW (manual, no automation)
- **Differentiation:** We offer automation, monitoring, alerts
- **Action:** Position as "automated spreadsheet alternative"

### Competitive Intelligence Monitoring Plan

**Monthly Monitoring:**

1. Check competitor websites for new features
2. Monitor product announcements and updates
3. Review pricing changes
4. Track user reviews and feedback

**Quarterly Deep Dive:**

1. Comprehensive feature comparison
2. Pricing analysis
3. Market positioning review
4. Update competitive analysis document

**Key Metrics to Track:**

- New feature launches
- Pricing changes
- User acquisition strategies
- Market positioning shifts
- Partnership announcements

### Market Gap Analysis

**Identified Gaps:**

1. **No Canadian Mortgage Monitoring Platform:** We're first to market
2. **No Trigger Rate Monitoring:** Unique feature we offer
3. **No Renewal Planning Tools:** High-value feature we're building
4. **Limited Canadian Mortgage Expertise:** Most tools are US-focused

**Opportunities:**

1. **First-Mover Advantage:** Be the first Canadian mortgage monitoring platform
2. **Specialization:** Deep mortgage expertise vs. general tools
3. **Monitoring Focus:** Ongoing value vs. one-time planning
4. **Canadian Market:** Less competition, better fit

---

## 9. Conclusion

### Competitive Landscape Summary

**ProjectionLab:**

- **Threat Level:** MEDIUM
- **Overlap:** Scenario planning, wealth forecasting
- **Differentiation:** We're mortgage-focused, they're general planning
- **Action:** Emphasize specialization, monitoring focus

**LunchMoney:**

- **Threat Level:** LOW
- **Overlap:** Minimal (different use cases)
- **Differentiation:** We're mortgage planning, they're budgeting
- **Action:** Focus on mortgage value, not budgeting

### Strategic Position

**Our Unique Position:**

- **Market:** Canadian mortgage optimization
- **Focus:** Monitoring and alerts (not just planning)
- **Expertise:** Canadian mortgage calculations, VRM modeling
- **Value:** Ongoing mortgage health monitoring

**Key Success Factors:**

1. **Specialization:** Deep mortgage expertise vs. general planning
2. **Monitoring:** Ongoing value vs. one-time planning
3. **Canadian Focus:** Less competition, better fit
4. **Unique Features:** Trigger rates, renewal planning, prime rate tracking

**Bottom Line:**
Neither ProjectionLab nor LunchMoney directly competes with our mortgage-focused product. However, they compete for user attention and time. Our strategy should emphasize:

- **Mortgage specialization** (vs. general planning)
- **Monitoring focus** (vs. one-time planning)
- **Canadian expertise** (vs. US-focused tools)
- **Complementary positioning** (works with other tools)

We have a **defensible position** in the Canadian mortgage optimization market with unique features competitors don't offer.

---

**Document Version:** 1.2  
**Last Updated:** January 2025  
**Maintained By:** Product Team  
**Next Review:** Quarterly competitive analysis updates recommended  
**Status:** Competitive Intelligence - Requires Periodic Review

**Previous Updates:**
- Added section on additional competitors to monitor, Canadian mortgage-specific tools, and competitive intelligence monitoring plan
