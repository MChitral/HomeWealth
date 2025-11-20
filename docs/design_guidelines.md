# Design Guidelines: Canadian Mortgage Strategy & Wealth Forecasting App

## Design Approach

**System:** Material Design + Carbon Design System hybrid  
**Justification:** Financial planning demands enterprise-grade data presentation (Carbon) with polished form interactions (Material Design). This combination establishes credibility while maintaining clarity for complex financial decisions.

**Core Principles:**
- Professional trust through structured, predictable layouts
- Information hierarchy prioritizing actionable insights
- Scannable dashboards with metric cards and clear data visualization
- Stability over trends—users need consistency for important financial decisions

---

## Color System

**Primary Palette:**
- Deep Blue: Primary actions, navigation highlights, positive trends
- Slate Gray: Text, borders, neutral data
- Sky Blue: Secondary actions, information states
- Charcoal: Headers, emphasis text

**Data Visualization:**
- Scenario 1: Deep Blue
- Scenario 2: Teal
- Scenario 3: Purple
- Scenario 4: Amber
- Positive metrics: Forest Green
- Negative metrics: Crimson Red
- Neutral/projections: Slate

**Semantic Colors:**
- Success: Green (EF fully funded, goals met)
- Warning: Orange (approaching thresholds)
- Error: Red (invalid inputs, negative cash flow)
- Info: Blue (tooltips, helper text)

---

## Typography

**Fonts:** Inter (UI/text), Roboto Mono (financial data)

**Hierarchy:**
- Page Titles: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body: text-base font-normal
- Labels: text-sm font-medium uppercase tracking-wide
- Financial Data: text-base font-mono
- Large Metrics: text-4xl font-bold font-mono
- Helper Text: text-sm opacity-70

---

## Layout System

**Spacing:** Tailwind units of 4, 6, 8, 12, 16

**Patterns:**
- Card padding: p-6
- Section spacing: mb-8 to mb-12
- Form gaps: space-y-4
- Grid gaps: gap-6
- Container: max-w-7xl mx-auto px-6 py-8

**Grid Structure:**
- Dashboard metrics: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Scenario cards: md:grid-cols-2 lg:grid-cols-3
- Comparison: lg:grid-cols-2 (side-by-side)
- Forms: Single column max-w-3xl, 2-column for related fields

---

## Component Library

### Navigation
**Top Bar:** Logo left, scenario dropdown center, user profile right, h-16, border-b, sticky
**Sidebar:** w-64, Dashboard, Scenarios, Comparison, Cash Flow, Emergency Fund, Settings

### Data Display
**Metric Cards:** Large value (text-4xl font-mono), label above, trend indicator, supporting info below, elevated shadow
**Tables:** Fixed header, striped rows, sticky first column (years), right-aligned numbers, monospace
**Timeline:** Vertical with year markers, milestone badges (mortgage payoff, EF targets), connecting line

### Forms
**Input Groups:** Label above, input below, helper text, error states with red border
**Number Inputs:** Right-aligned monospace, $ prefix or % suffix
**Sliders:** Combined with number input for prepay/invest allocation
**Toggles:** Boolean settings (bonus allocation)
**Radio Groups:** Horizontal for 2-3 options, vertical for 4+

### Charts (Recharts)
**Net Worth Line:** Multi-line scenario comparison, tooltips with formatted currency, gridlines
**Mortgage Area:** Stacked principal/interest visualization
**Cash Flow Bars:** Monthly surplus/deficit
**Allocation Pie:** EF, investments, prepayments breakdown

### Scenario Management
**Scenario Card:** Title, description, last modified, quick metrics preview (net worth at year 30, payoff date), Edit/Compare/Duplicate buttons
**Comparison Panel:** 2-4 scenarios side-by-side, synchronized scroll, highlighted differences

---

## Page Layouts

### Dashboard
**Hero Metrics:** 4-column grid (Net Worth, Mortgage Balance, EF Progress, Investment Total), large values with trend arrows
**Main Chart:** Full-width net worth projection comparing all scenarios
**Secondary Charts:** 2-column grid (Mortgage Paydown + Investment Growth)
**Quick Actions:** New Scenario, Run Projection, Export buttons
**Recent Activity:** Last 3 scenarios edited

### Scenario Editor
**Sticky Header:** Scenario name input, Save/Cancel buttons, last saved timestamp
**Tabbed Sections:** Mortgage Details, Income & Expenses, Emergency Fund, Investments, Prepayment Strategy
**Form Layout:** Logical grouping with collapsible advanced options
**Live Preview Sidebar:** Right panel (desktop) showing calculated metrics updating as user types

### Scenario Comparison
**Scenario Selector:** Multi-select (2-4 scenarios), Clear All button
**Configuration Table:** Side-by-side comparison with diff highlighting (green for better, gray for same)
**Chart Section:** Synchronized net worth comparison, mortgage payoff timeline, investment growth
**Winner Callout:** Prominent card showing optimal scenario at 10/20/30 years with reasons

### Cash Flow Analysis
**Monthly Breakdown:** Table with income, expenses, surplus/deficit, expandable categories
**Visualization:** Bar chart showing monthly cash flow over projection period
**Annual Summary:** Year-over-year comparison cards

### Emergency Fund Tracker
**Progress Bar:** Current vs target with percentage, visual indicator
**Timeline to Goal:** Projection chart showing months to full funding
**Funding Strategy:** Configuration for monthly contributions vs lump sum

### Mortgage Tracking
**Amortization Table:** Year-by-year breakdown with principal, interest, balance
**Payoff Timeline:** Visual timeline showing projected payoff date
**Prepayment Impact:** Before/after comparison showing time and interest saved

---

## Images

**Dashboard Hero Background:** Abstract geometric pattern with financial graph elements (subtle, low opacity), positioned behind hero metrics, maintains readability
**Empty States:** Illustration for "No scenarios yet" (friendly graph/calculator icon), "Create your first projection" CTA

---

## Critical Constraints

- Natural content flow—no forced viewport heights except dashboard hero
- All inputs have labels, charts have ARIA descriptions, full keyboard navigation
- Minimal animations—data updates smoothly without distraction
- Responsive: Mobile single-column, tablet 2-column, desktop 3-4 columns
- Strategic whitespace around dense tables/charts for comfortable scanning
- Buttons on hero backgrounds use backdrop-blur-md with semi-transparent backgrounds