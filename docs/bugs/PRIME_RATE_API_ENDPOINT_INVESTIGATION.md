# Prime Rate API Endpoint Investigation

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## Problem

User suspects we might be fetching the **policy rate** (overnight rate) instead of the **prime rate**.

**Evidence:**
- Bank of Canada shows policy rate: **2.25%** (as of Oct 29, 2025)
- Our API returns: **4.45%** (current)
- User's bank shows effective rate: **3.55%**
- If spread is -0.9%: Prime = 3.55% + 0.9% = **4.45%** ✓

---

## Key Distinction

### Policy Rate (Overnight Rate)
- Set by Bank of Canada
- Currently: **2.25%** (as of Oct 29, 2025)
- Used for interbank lending
- **NOT** what banks use for mortgages

### Prime Rate
- Set by individual banks (RBC, TD, etc.)
- Typically: **Policy Rate + 2-3%**
- Currently: Around **4.25-5.25%** (varies by bank)
- **This is what mortgages use**

---

## Current API Endpoint

**Endpoint:** `V121796`  
**URL:** `https://www.bankofcanada.ca/valet/observations/V121796/json`

**What it returns:**
- Values around 4.45-5.45%
- These look like prime rates, not policy rates
- But need to verify what V121796 actually represents

---

## Bank of Canada API Series

Bank of Canada provides different series:
- **Policy Rate (Overnight Rate):** Different series code
- **Prime Rate:** May not be directly available (banks set their own)
- **V121796:** Need to verify what this represents

---

## Investigation Steps

1. **Check Bank of Canada API Documentation:**
   - Verify what series V121796 represents
   - Check if there's a better endpoint for prime rate

2. **Check What Banks Actually Use:**
   - RBC Prime Rate
   - TD Prime Rate
   - BMO Prime Rate
   - These are typically policy rate + ~2-3%

3. **Verify Current Values:**
   - Policy rate: 2.25% (from Bank of Canada)
   - Prime rate: ~4.25-5.25% (from banks)
   - Our API: 4.45% (matches prime rate range)

---

## Potential Solutions

### Option 1: Use Bank-Specific Prime Rate APIs
- Some banks publish their prime rates via API
- More accurate but requires multiple sources

### Option 2: Calculate Prime from Policy Rate
- Prime = Policy Rate + 2.5% (average)
- Simple but less accurate

### Option 3: Verify V121796 is Correct
- If V121796 is actually prime rate, keep using it
- Just need to verify it's the right endpoint

---

## Next Steps

1. Verify what V121796 actually represents
2. Check Bank of Canada API documentation
3. Compare with actual bank prime rates
4. Update endpoint if needed

