# Canadian Mortgage Strategy & Wealth Forecasting App - Design Guidelines

## Design Approach
**Selected System**: Carbon Design System + Material Design hybrid
**Rationale**: Financial applications demand clarity, data hierarchy, and trustworthiness. Carbon excels at information-dense interfaces while Material provides robust component patterns for interactive financial tools.

---

## Typography Hierarchy

**Font Stack**: IBM Plex Sans (Carbon's native typeface) via Google Fonts
- **Display/Hero**: 48px (3xl), font-bold - Dashboard headers, projection totals
- **Headings H1**: 36px (2xl), font-semibold - Section titles, card headers
- **Headings H2**: 24px (xl), font-semibold - Subsection labels
- **Body Large**: 18px (lg), font-normal - Primary financial figures, key metrics
- **Body**: 16px (base), font-normal - Standard text, descriptions
- **Data Labels**: 14px (sm), font-medium - Chart labels, table headers
- **Captions**: 12px (xs), font-normal - Secondary info, timestamps

**Financial Number Treatment**: Tabular numbers (font-variant-numeric: tabular-nums) for all currency/percentage displays

---

## Layout System

**Spacing Scale**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20** for consistent rhythm
- Component padding: p-6 (cards), p-8 (sections)
- Section spacing: space-y-8 (component stacks), gap-6 (grids)
- Dashboard grids: gap-6 between metric cards

**Container Strategy**:
- Max-width: max-w-7xl for main dashboard
- Sidebar: Fixed 280px (w-70) for navigation
- Main content: flex-1 with proper responsive breakpoints

---

## Core Component Library

### Navigation
**Top Navigation Bar**: Fixed header with app branding, global actions (settings, profile), dark mode toggle
**Left Sidebar**: Persistent navigation with sections:
- Dashboard (home icon)
- Mortgage Details (house icon)
- Cash Flow Manager (trending-up icon)
- Scenario Comparison (git-compare icon)
- Reports (document icon)

### Dashboard Components

**Metric Cards** (4-column grid on desktop, 2 on tablet, 1 on mobile):
- Large number display with trend indicator (up/down arrow + percentage)
- Supporting context label below
- Subtle border, elevated shadow on hover
- Examples: Current Net Worth, Total Home Equity, Monthly Cash Flow, Emergency Fund Balance

**Projection Chart Section**:
- Full-width area chart showing 10-30 year net worth projections
- Multiple scenario comparison with distinct line styles
- Interactive legend for toggling scenarios
- Y-axis: Currency formatted, X-axis: Years
- Tooltip showing detailed breakdown on hover

**Mortgage Summary Card**:
- Principal/Interest breakdown (donut chart)
- Remaining balance (large display)
- Payment schedule table preview
- VRM rate indicator with rate adjustment timeline

**Cash Flow Breakdown**:
- Horizontal stacked bar chart showing income vs expenses
- Category-wise allocation (housing, investments, discretionary)
- Monthly/Yearly toggle

### Forms & Inputs

**Financial Input Fields**:
- Currency prefix ($) embedded in input
- Right-aligned numbers for scanning
- Clear validation states (error borders, success checkmarks)
- Helper text below for guidance (e.g., "Based on current market rates")

**Scenario Builder**:
- Side-by-side comparison cards (2-column layout)
- Adjustable sliders for: prepayment amount, investment allocation, timeframe
- Real-time calculation updates
- "Compare Scenarios" primary action button (blurred background when on images)

### Data Tables

**Amortization Schedule**:
- Sticky header row
- Striped rows for readability
- Columns: Payment #, Date, Payment Amount, Principal, Interest, Remaining Balance
- Export to CSV action button
- Pagination with 25/50/100 rows options

---

## Images Section

**Hero Image Placement**: 
- **Location**: Dashboard landing page hero section (not full viewport - approximately 60vh)
- **Description**: Professional photograph of a modern Canadian home exterior with clean architectural lines, well-maintained property, natural lighting. Conveys stability, aspiration, and Canadian homeownership success. Subtle gradient overlay (dark at bottom) for text contrast.
- **Text Overlay**: Large headline "Build Your Wealth Strategy" with subtitle explaining the app's value proposition. Primary CTA button with blurred background treatment.

**Supporting Images**:
- Small illustrative icons/graphics for empty states (e.g., "No scenarios created yet")
- Graph placeholder thumbnails for report previews

---

## Chart Specifications (Recharts)

**Visual Treatment**:
- Area charts: Gradient fills (opacity 0.1 to 0.3)
- Line charts: 2px stroke width, smooth curves
- Grid: Subtle horizontal lines only
- Tooltips: Card-style with shadow, rounded corners
- Color coding: Consistent across all charts (Scenario A: primary, Scenario B: secondary)

**Responsive Behavior**:
- Desktop: Full detail with all data points
- Tablet: Simplified legend, maintain interactivity
- Mobile: Stacked charts, simplified tooltips

---

## Accessibility & Readability

- Minimum contrast ratio: 4.5:1 for all text
- Focus indicators: 2px solid outline on all interactive elements
- Screen reader labels for all charts and data visualizations
- Keyboard navigation: Full support for tab navigation through forms and tables
- Error messages: Clear, actionable, and positioned near relevant fields

---

**Animation**: Minimal - only smooth transitions on data updates (300ms ease-in-out) and chart rendering. No decorative animations that could distract from financial data analysis.