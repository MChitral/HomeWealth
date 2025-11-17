# 🎨 Design Deficiencies - Must Fix Before Building

## Critical Design Issues

Based on PRD analysis, here are UI/UX design issues that need fixing before we implement the backend:

---

## 🔴 **1. Mortgage History Page - Missing Variable Rate Controls**

### **Current State:**
- Only shows "Variable-Fixed Payment" in mock data
- No way to specify mortgage type when adding payments
- Missing payment frequency selector

### **PRD Requirement:**
```
Supported Mortgage Types:
  - Fixed Rate
  - Variable Rate (VRM) - changing payment
  - Variable Rate - fixed payment + trigger rate
  
Payment Frequency:
  - Monthly
  - Bi-weekly (26 payments)
  - Accelerated bi-weekly
```

### **What's Missing in UI:**

1. **"Add Payment" Dialog needs:**
   - ❌ Mortgage Type selector (Fixed / VRM-Changing / VRM-Fixed)
   - ❌ Payment Frequency selector (Monthly / Bi-weekly / Accelerated Bi-weekly)
   - ❌ Conditional fields based on type:
     - If Fixed: Show "Fixed Rate" input
     - If Variable: Show "Prime Rate" + "Spread" inputs
   - ❌ Trigger rate warning (for VRM-Fixed type)

2. **Current Term Card needs:**
   - ❌ Show payment frequency
   - ❌ Show mortgage type badge
   - ❌ Trigger rate status (for VRM-Fixed)

### **Impact:** 🔴 **CRITICAL** - Can't log variable mortgages properly

---

## 🔴 **2. Comparison Page - Limited to 3 Scenarios**

### **Current State:**
```tsx
// comparison-page.tsx line ~40
const maxScenarios = 3;
```

### **PRD Requirement:**
```
Compare up to 4 scenarios
```

### **What's Missing:**
- ❌ Support for 4 scenarios (currently hardcoded to 3)
- ❌ Responsive layout for 4 scenarios (3-column works, 4-column needs testing)

### **Impact:** 🟡 **MEDIUM** - Simple fix, but affects comparison value

---

## 🟡 **3. Scenario Editor - Missing Prime Scenario Controls**

### **Current State:**
- Shows "Current Mortgage Position" (good!)
- Has prepayment inputs (good!)
- **Missing**: Future Prime rate assumptions

### **PRD Requirement:**
```
Prime ± spread modeling
Custom Prime rate schedules
Rate reset logic
Stress-test slider
```

### **What's Missing in Mortgage Tab:**

1. **Future Rate Assumptions Section:**
   - ❌ Prime scenario selector: Optimistic / Baseline / Pessimistic
   - ❌ Custom Prime schedule (advanced):
     - Year 1-2: X%
     - Year 3-5: Y%
     - Year 6+: Z%
   - ❌ Stress-test slider: "What if Prime goes to X%?"

2. **Rate Reset Preview:**
   - ❌ "Your term renews in 2029-01" callout
   - ❌ "Projected rate at renewal: Prime + new spread"

### **Impact:** 🟡 **MEDIUM** - Core feature but can start simple

---

## 🟡 **4. Cash Flow Page - Missing Surplus Calculation Display**

### **Current State:**
- All input fields present ✅
- **Missing**: Any output/summary

### **PRD Requirement:**
```
Outputs:
  - Monthly surplus / deficit
  - Income vs expenses chart
  - Surplus before allocation
```

### **What's Missing:**

1. **Summary Card** (even with placeholder numbers):
```tsx
<Card>
  <CardHeader>
    <CardTitle>Monthly Cash Flow Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Monthly Income (base)</span>
        <span className="font-mono">$8,000</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Extra paycheques (annualized)</span>
        <span className="font-mono">+$1,333/mo</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Annual bonus (annualized)</span>
        <span className="font-mono">+$833/mo</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Total Monthly Income</span>
        <span className="font-mono text-green-600">$10,166</span>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between">
        <span>Fixed Expenses</span>
        <span className="font-mono">-$2,000</span>
      </div>
      <div className="flex justify-between">
        <span>Variable Expenses</span>
        <span className="font-mono">-$1,500</span>
      </div>
      <div className="flex justify-between">
        <span>Other Debt</span>
        <span className="font-mono">-$500</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Mortgage Payment (from history)</span>
        <span className="font-mono">-$2,100</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold text-lg">
        <span>Monthly Surplus</span>
        <span className="font-mono text-primary">$4,066</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Available for emergency fund, investments, and mortgage prepayment
      </p>
    </div>
  </CardContent>
</Card>
```

### **Impact:** 🟡 **MEDIUM** - Users need to see if they have surplus

---

## 🟡 **5. Emergency Fund Page - Missing Timeline Visualization**

### **Current State:**
- Target calculator present ✅
- Educational content present ✅
- **Missing**: Timeline estimate

### **What's Missing:**

1. **Timeline Estimate Card:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Funding Timeline</CardTitle>
    <CardDescription>Based on scenarios</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground mb-4">
      Your scenarios will determine how quickly you reach this target:
    </p>
    <div className="space-y-2">
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm">Aggressive: $1,000/month</span>
        <span className="font-mono text-sm font-semibold">30 months</span>
      </div>
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm">Balanced: $500/month</span>
        <span className="font-mono text-sm font-semibold">60 months</span>
      </div>
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm">Conservative: $300/month</span>
        <span className="font-mono text-sm font-semibold">100 months</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### **Impact:** 🟢 **LOW** - Nice to have, not critical for MVP

---

## 🟡 **6. Dashboard - Needs Quick Actions**

### **Current State:**
- Likely empty or basic

### **What's Needed:**

1. **Quick Start Guide** (for new users):
   - ☑️ Step 1: Set up Cash Flow → Navigate to Cash Flow
   - ☑️ Step 2: Set Emergency Fund Target → Navigate to EF
   - ☑️ Step 3: Log Mortgage Payments → Navigate to History
   - ☑️ Step 4: Create First Scenario → Navigate to Scenarios

2. **Status Cards**:
   - Current mortgage balance
   - Monthly surplus
   - EF progress (if set)
   - Number of scenarios created

### **Impact:** 🟢 **LOW** - UX polish, not critical for MVP

---

## 🔴 **7. Term Renewal Dialog - Missing in Mortgage History**

### **Current State:**
- Mock data shows term renewals
- **No UI to actually log a term renewal**

### **PRD Requirement:**
```
Rate reset logic
Refinance blocks
```

### **What's Missing:**

**"Term Renewal" Dialog:**
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Log Term Renewal</DialogTitle>
      <DialogDescription>
        Your 5-year term is ending. Log the new term details.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label>New Term Start Date</Label>
        <Input type="date" />
      </div>
      
      <div>
        <Label>New Term Length</Label>
        <Select>
          <SelectItem value="1">1 Year</SelectItem>
          <SelectItem value="2">2 Years</SelectItem>
          <SelectItem value="3">3 Years</SelectItem>
          <SelectItem value="5">5 Years</SelectItem>
        </Select>
      </div>
      
      <div>
        <Label>Mortgage Type</Label>
        <Select>
          <SelectItem value="fixed">Fixed Rate</SelectItem>
          <SelectItem value="variable-changing">Variable (Changing Payment)</SelectItem>
          <SelectItem value="variable-fixed">Variable (Fixed Payment)</SelectItem>
        </Select>
      </div>
      
      {/* If Fixed */}
      <div>
        <Label>New Fixed Rate (%)</Label>
        <Input type="number" step="0.01" />
      </div>
      
      {/* If Variable */}
      <div>
        <Label>Current Prime Rate (%)</Label>
        <Input type="number" step="0.01" />
      </div>
      <div>
        <Label>New Spread (Prime ± %)</Label>
        <Input type="number" step="0.01" placeholder="e.g., -0.80" />
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### **Impact:** 🔴 **CRITICAL** - Can't model term renewals without this

---

## 📊 **8. Comparison Page - Missing Key Metrics Display**

### **Current State:**
- Scenario selector works ✅
- Charts are placeholders
- **Missing**: Key metric cards

### **What's Missing:**

**Winner Callout (above tabs):**
```tsx
<Card className="border-primary bg-primary/5">
  <CardContent className="p-6">
    <div className="flex items-start gap-4">
      <Trophy className="h-8 w-8 text-primary" />
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Best Strategy: Balanced
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Highest net worth at 10 years with acceptable risk
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Net Worth</p>
            <p className="font-mono font-semibold text-lg">$485,000</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mortgage Payoff</p>
            <p className="font-mono font-semibold text-lg">18.2 years</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Saved</p>
            <p className="font-mono font-semibold text-lg text-green-600">$24,000</p>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**Metrics Tab - Comparison Table:**
Currently missing structured comparison table.

### **Impact:** 🔴 **CRITICAL** - This is the core value prop!

---

## 🎯 **PRIORITIZED FIX LIST**

### **Must Fix Before Building (Week 1):**

1. 🔴 **Mortgage History - Variable Rate UI**
   - Add mortgage type selector to "Add Payment" dialog
   - Add payment frequency selector
   - Add conditional fields (Prime/Spread for variable)
   - Add trigger rate indicator

2. 🔴 **Mortgage History - Term Renewal Dialog**
   - Create "Log Term Renewal" dialog
   - Include all term renewal fields

3. 🔴 **Comparison Page - Winner Callout**
   - Add winner determination card (even with mock data)
   - Add key metrics display

4. 🟡 **Comparison Page - Support 4 Scenarios**
   - Change maxScenarios from 3 to 4
   - Test responsive layout

5. 🟡 **Cash Flow Page - Surplus Summary**
   - Add summary card showing surplus calculation
   - Include mortgage payment from history

### **Nice to Have (Can Fix Later):**

6. 🟡 **Scenario Editor - Prime Scenarios**
   - Add future rate assumptions section
   - Add stress-test slider

7. 🟡 **Emergency Fund Page - Timeline**
   - Add scenario-based timeline estimates

8. 🟢 **Dashboard - Quick Start**
   - Add onboarding checklist
   - Add status cards

---

## 📋 **SUMMARY**

**Critical Fixes (Must Do):** 3 items  
**Medium Priority (Should Do):** 4 items  
**Low Priority (Nice to Have):** 2 items  

**Estimated Design Work:** 1-2 days  
**Impact:** Ensures UI matches backend data model before we build

Once these are fixed, the backend schema will map perfectly to the UI! 🎯
