# Invoice Pricing Structure Fix

## Issue
The invoice pricing was not correctly reflecting the settings defined in the app. The time slot durations in the code did not match the actual time slots shown in the UI, causing incorrect price calculations.

## Root Cause Analysis
1. The `getSlotDuration` function was using incorrect time ranges that didn't match what was displayed in the UI
2. For example, Early Morning was calculated as 1.25 hours (7:45-9:00) in the code, but the UI showed 1.5 hours (7:30-9:00)
3. This discrepancy caused all price calculations to be incorrect when generating invoices

## Solution
1. Updated the `getSlotDuration` function to match the actual time slots shown in the UI:
   - Early: 1.5 hours (7:30-9:00) instead of 1.25 hours
   - Morning: 3.0 hours (9:00-12:00) instead of 2.5 hours
   - Lunch: 1.0 hour (12:00-13:00) instead of 1.5 hours
   - Afternoon: 2.0 hours (13:00-15:00) - unchanged
   - Late: 2.5 hours (15:30-18:00) instead of 2.5 hours (15:00-17:30)

2. Added an `ensurePricingSettings` function to validate pricing settings at initialization:
   - Checks if pricing settings exist and are valid numbers
   - Initializes with default values if missing or invalid
   - Logs the current pricing settings for debugging
   - Automatically saves any corrections to app data

3. Updated the `initInvoicesModule` function to call `ensurePricingSettings()` at initialization

## Verification
After the fix, the invoice correctly calculates prices based on the defined pricing structure:
- Early Morning (7:30-9:00): £5.00 × 1.5 hours = £7.50 per session
- Standard Hours (9:00-15:00): £5.30 × hours attended
- Late Afternoon (15:30-18:00): £10.00 × 2.5 hours = £25.00 per session

This ensures that invoices accurately reflect the pricing structure defined in the settings.
