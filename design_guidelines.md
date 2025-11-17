# Design Guidelines: Canadian Mortgage Strategy & Wealth Forecasting App

## Design Approach

**Selected System:** Material Design + Carbon Design System hybrid  
**Justification:** This financial planning application requires a data-heavy, trust-building interface. Material Design provides excellent form components and visual feedback, while Carbon's enterprise patterns guide dashboard and table design.

**Core Principles:**
- Professional credibility through clean, structured layouts
- Information hierarchy that guides users through complex data
- Scannable dashboards prioritizing key metrics
- Trust-building through consistent, predictable interactions

---

## Typography System

**Font Stack:** Inter (primary), Roboto Mono (numeric data)

**Hierarchy:**
- **Page Titles:** text-3xl font-semibold (Scenario Comparison, Dashboard)
- **Section Headers:** text-xl font-semibold (Mortgage Configuration, Cash Flow)
- **Card Titles:** text-lg font-medium
- **Body Text:** text-base font-normal
- **Labels:** text-sm font-medium uppercase tracking-wide
- **Numeric Data:** text-base font-mono (balances, projections)
- **Large Metrics:** text-4xl font-bold font-mono (net worth callouts)
- **Helper Text:** text-sm font-normal opacity-70

---

## Layout System

**Spacing Primitives:** Tailwind units of 3, 4, 6, 8, 12, 16  
**Common patterns:**
- Card padding: p-6
- Section margins: mb-8 or mb-12
- Form field gaps: space-y-4
- Grid gaps: gap-6
- Page containers: px-6 py-8

**Grid Structure:**
- Dashboard: 3-column metric cards (grid-cols-1 md:grid-cols-3 gap-6)
- Scenario list: 2-column cards (md:grid-cols-2)
- Comparison view: Side-by-side 2-column (lg:grid-cols-2)
- Forms: Single column max-w-4xl with 2-column sections for related fields

---

## Component Library

### Navigation
- **Top Navigation Bar:** Fixed header with logo left, scenario selector center, user menu right, height h-16, border-b
- **Sidebar:** Persistent left sidebar (w-64) with Dashboard, Scenarios, Comparison, Settings links

### Data Display
- **Metric Cards:** Elevated cards with large numeric value, label above, trend indicator, compact info below
- **Projection Tables:** Striped rows, fixed header, sticky first column for year labels, monospace numbers right-aligned
- **Timeline View:** Vertical timeline with year markers, milestone indicators for mortgage payoff/EF targets

### Forms
- **Input Groups:** Label above, input below, helper text underneath, error states with red border + message
- **Number Inputs:** Right-aligned monospace text, currency prefix ($), percentage suffix (%)
- **Radio Groups:** Horizontal for 2-3 options (payment frequency), vertical for 4+ options
- **Toggle Switches:** For boolean configs (use_bonus_for_prepay)
- **Slider + Input Combo:** Prepay/invest split percentage with live preview

### Charts (Recharts)
- **Net Worth Line Chart:** Multi-line comparing scenarios, gridlines, tooltips with formatted currency
- **Mortgage Balance Area Chart:** Stacked showing principal vs interest paid
- **Cash Flow Bar Chart:** Monthly surplus/deficit visualization
- **Allocation Pie Chart:** EF, investments, prepayments distribution

### Scenario Management
- **Scenario Card:** Title, description, last modified date, "Edit" and "Compare" action buttons, quick metrics preview
- **Comparison Panel:** 2-3 scenarios side-by-side with synchronized scrolling, highlighted differences

### Dashboard Layout
- **Top Metrics Row:** 4 key KPIs (Net Worth, Mortgage Balance, EF Status, Investment Total)
- **Chart Section:** Large net worth projection chart spanning full width below metrics
- **Quick Actions:** Buttons for "New Scenario", "Run Projection", "Export Data"

---

## Page-Specific Layouts

### Dashboard Page
- Hero metrics: 4-column grid showing current net worth, mortgage balance, EF progress, total investments
- Main chart: Full-width net worth projection over time
- Secondary charts: 2-column grid for mortgage paydown + investment growth
- Recent scenarios: List of 3 most recent with quick access

### Scenario Editor
- Sticky header: Scenario name input, save/cancel buttons
- Tabbed sections: Mortgage, Cash Flow, Emergency Fund, Investments, Prepayments
- Each tab: Form with logical grouping, collapsible advanced options
- Live preview panel (right sidebar on desktop): Shows key calculated metrics as user types

### Comparison Page
- Scenario selector: Multi-select dropdown to choose 2-3 scenarios
- Comparison table: Side-by-side configurations with diff highlighting
- Synchronized charts: Net worth comparison, mortgage payoff timeline
- Winner callout: Prominent card showing which scenario achieves highest net worth at year 10, 20, 30

### Projection Timeline
- Table view: Expandable yearly summaries with monthly detail rows
- Chart view: Switch between different metrics (balance, equity, cash flow)
- Export button: CSV download for detailed analysis

---

## Critical Constraints

- **No viewport forcing:** Natural content flow, no 100vh sections except dashboard hero
- **Accessibility:** All form inputs have associated labels, ARIA labels on charts, keyboard navigation throughout
- **No animations:** Stable, professional interface prioritizing trust over flair
- **Responsive breakpoints:** Mobile stacks to single column, tablet shows 2 columns, desktop full 3-column layouts
- **Data density:** Comfortable information density without overwhelming—use whitespace strategically around dense tables/charts