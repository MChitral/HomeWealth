# Prime Rate Scheduler Guide

**Date:** 2025-01-27  
**Purpose:** Automatic prime rate change detection and VRM updates

---

## Overview

The prime rate scheduler automatically checks for Bank of Canada prime rate changes and updates all active variable rate mortgage terms. This eliminates the need for manual rate updates and ensures projections always use current rates.

---

## How It Works

### Schedule
- **Default:** Daily at 9:00 AM Eastern Time (America/Toronto timezone)
- **Frequency:** Once per day
- **Timezone:** Eastern Time (matches Bank of Canada announcements)

### Process
1. Fetches latest prime rate from Bank of Canada API
2. Compares with last recorded rate in database
3. If changed:
   - Records new rate in history
   - Updates all active VRM terms
   - Logs results
4. If unchanged:
   - Logs current rate
   - No updates needed

---

## Configuration

### Environment Variables

#### `ENABLE_PRIME_RATE_SCHEDULER`
- **Type:** Boolean string (`"true"` or `"false"`)
- **Default:** 
  - `true` in production
  - `false` in development
- **Description:** Enable or disable the scheduler

**Examples:**
```bash
# Enable in development
ENABLE_PRIME_RATE_SCHEDULER=true npm run dev

# Disable in production
ENABLE_PRIME_RATE_SCHEDULER=false npm start
```

#### `PRIME_RATE_SCHEDULE`
- **Type:** Cron expression string
- **Default:** `"0 9 * * *"` (9:00 AM daily)
- **Description:** Customize when the scheduler runs

**Cron Format:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

**Examples:**
```bash
# Run twice daily (9 AM and 3 PM)
PRIME_RATE_SCHEDULE="0 9,15 * * *"

# Run every 6 hours
PRIME_RATE_SCHEDULE="0 */6 * * *"

# Run only on weekdays at 10 AM
PRIME_RATE_SCHEDULE="0 10 * * 1-5"

# Run every Monday at 9 AM
PRIME_RATE_SCHEDULE="0 9 * * 1"
```

---

## Manual Trigger

You can also manually trigger a prime rate check via API:

```bash
POST /api/prime-rate/check-and-update
```

**Response:**
```json
{
  "success": true,
  "changed": true,
  "previousRate": 6.450,
  "newRate": 6.750,
  "effectiveDate": "2024-03-15",
  "termsUpdated": 5,
  "errors": [],
  "message": "Prime rate changed from 6.45% to 6.75%. Updated 5 VRM terms."
}
```

---

## Logging

The scheduler logs all activities:

### Successful Check (No Change)
```
[Prime Rate Scheduler] Checking for prime rate changes...
[Prime Rate Scheduler] No change detected. Current rate: 6.45%
```

### Successful Check (Rate Changed)
```
[Prime Rate Scheduler] Checking for prime rate changes...
[Prime Rate Scheduler] Prime rate changed from 6.45% to 6.75%
[Prime Rate Scheduler] Updated 5 VRM terms
```

### Errors
```
[Prime Rate Scheduler] Error checking prime rate: <error message>
```

---

## Best Practices

### 1. Production Deployment
- **Enable scheduler:** Set `ENABLE_PRIME_RATE_SCHEDULER=true`
- **Use default schedule:** 9:00 AM daily is optimal
- **Monitor logs:** Check for errors regularly

### 2. Development
- **Disable by default:** Scheduler is disabled in development
- **Enable when testing:** Set `ENABLE_PRIME_RATE_SCHEDULER=true` to test
- **Use manual trigger:** Prefer API endpoint for testing

### 3. Testing
- **Manual trigger:** Use API endpoint for controlled testing
- **Mock Bank of Canada API:** Use test fixtures for consistent results
- **Verify updates:** Check that VRM terms are updated correctly

---

## Troubleshooting

### Scheduler Not Running

**Check:**
1. Is `ENABLE_PRIME_RATE_SCHEDULER` set correctly?
2. Check server logs for scheduler startup message
3. Verify cron expression is valid

**Solution:**
```bash
# Check environment variable
echo $ENABLE_PRIME_RATE_SCHEDULER

# Enable explicitly
ENABLE_PRIME_RATE_SCHEDULER=true npm start
```

### Rate Changes Not Detected

**Check:**
1. Is Bank of Canada API accessible?
2. Are there network issues?
3. Check error logs for API failures

**Solution:**
- Use manual trigger to test: `POST /api/prime-rate/check-and-update`
- Check Bank of Canada API status
- Verify network connectivity

### Terms Not Updated

**Check:**
1. Are terms active? (current date between startDate and endDate)
2. Are terms variable rate? (termType starts with "variable")
3. Check error logs for update failures

**Solution:**
- Verify term dates are correct
- Check term type is variable
- Review error messages in scheduler logs

---

## Monitoring

### Key Metrics to Monitor

1. **Scheduler Execution:** Verify it runs daily
2. **Rate Changes:** Track frequency of rate changes
3. **Update Success Rate:** Monitor termsUpdated vs errors
4. **API Availability:** Track Bank of Canada API response times

### Recommended Alerts

1. **Scheduler Failure:** Alert if scheduler doesn't run for 2+ days
2. **High Error Rate:** Alert if >10% of updates fail
3. **API Failures:** Alert if Bank of Canada API is unavailable

---

## Future Enhancements

1. **Retry Logic:** Retry failed API calls
2. **Rate Change Notifications:** Email/push notifications when rate changes
3. **Historical Analysis:** Track rate change patterns
4. **Multiple Timezones:** Support different timezones for scheduling
5. **Health Checks:** Endpoint to check scheduler status

---

## Conclusion

The prime rate scheduler provides automatic, reliable prime rate change detection and VRM term updates. Configure it appropriately for your environment and monitor its execution to ensure optimal performance.

