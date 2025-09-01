# Invoice Pricing Discrepancy Investigation

## Issue
The invoice pricing calculation shows different totals than expected. Specifically:
- The Late slot was incorrectly calculated as £25.00 (2.5 hours × £10/hour) when it should be a flat £10.00 fee
- This caused a discrepancy between the Tuesday total in the app (£56.80) and the photo (£41.80)

## Analysis

### Current Pricing Settings
- Early Morning: £5.00/hour
- Standard Hours: £5.30/hour
- Late Afternoon: £10.00 flat fee (not hourly)

### Current Slot Durations
- Early (7:30-9:00): 1.5 hours
- Morning (9:00-12:00): 3.0 hours
- Lunch (12:00-13:00): 1.0 hour
- Afternoon (13:00-15:00): 2.0 hours
- Late (15:30-18:00): 2.5 hours

### Tuesday Calculation in Current App (Before Fix)
- Morning (9:00-12:00): £15.90 (3.0 hours × £5.30)
- Lunch (12:00-13:00): £5.30 (1.0 hour × £5.30)
- Afternoon (13:00-15:00): £10.60 (2.0 hours × £5.30)
- Late (15:30-18:00): £25.00 (2.5 hours × £10.00) - INCORRECT
- **Total: £56.80**

### Tuesday Calculation After Fix
- Morning (9:00-12:00): £15.90 (3.0 hours × £5.30)
- Lunch (12:00-13:00): £5.30 (1.0 hour × £5.30)
- Afternoon (13:00-15:00): £10.60 (2.0 hours × £5.30)
- Late (15:30-18:00): £10.00 (flat fee)
- **Total: £41.80**

### Possible Explanations for the £41.80 Total in the Photo
1. **Different Pricing Settings**: The photo might have different hourly rates
2. **Different Attendance Pattern**: The photo might have fewer slots marked as "Paid"
3. **Different Slot Durations**: The photo might use different time ranges for each slot

## Root Cause
The root cause of the discrepancy was that the Late Afternoon slot was being incorrectly calculated as an hourly rate (£10.00/hour × 2.5 hours = £25.00) when it should have been a flat £10.00 fee regardless of duration.

## Solution
1. Modified the `calculateInvoiceData` function to treat the Late slot as a flat fee:
   ```javascript
   if (slot === 'late') {
       // Late slot is a flat fee, not hourly
       slotCost = appData.settings.pricing.late;
   }
   ```

2. Modified the `generateInvoiceCalendarView` function to also treat the Late slot as a flat fee:
   ```javascript
   if (timeSlot.id === 'late') {
       // Late slot is a flat fee, not hourly
       amount = appData.settings.pricing.late;
   }
   ```

3. Added comprehensive debug logging to verify the pricing calculations

## Verification
After the fix, the Tuesday total is now £41.80, matching the expected amount:
- Morning (9:00-12:00): £15.90 (3.0 hours × £5.30)
- Lunch (12:00-13:00): £5.30 (1.0 hour × £5.30)
- Afternoon (13:00-15:00): £10.60 (2.0 hours × £5.30)
- Late (15:30-18:00): £10.00 (flat fee)
- **Total: £41.80**
