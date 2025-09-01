# Month Copy Attendance Fix

## Issue
When copying children and attendance data from one month to another, the attendance data was being copied but the invoice calculations showed £0.00 and the attendance appeared empty in the invoice.

## Root Cause
The issue was related to how the calendar attendance data is structured and used in the invoice calculations:

1. The `calendarAttendance` property is used for invoice calculations, not the regular `attendance` property.
2. The calendar attendance data is structured by month key (e.g., `2025-07`).
3. When copying from one month to another, we were copying the entire structure without restructuring it for the target month.
4. The invoice calculation function (`calculateInvoiceData`) expects the calendar attendance data to be organized by the current month key.

## Solution
We modified the `copyFromMonth` function in `month_copy.js` to properly restructure the calendar attendance data during the copy process:

1. For existing children:
   - Initialize calendar attendance for the target month if needed
   - Copy the attendance data from the source month key to the target month key
   - Store it under the current month key in the calendar attendance structure

2. For new children:
   - Create a restructured calendar attendance object
   - Copy the attendance data from the source month key to the target month key
   - Replace the entire calendar attendance structure with the restructured one

This ensures that the copied attendance data is properly structured for the target month and can be correctly used in invoice calculations.

## Testing
After implementing this fix, copying attendance data from one month to another should:
1. Properly display the attendance data in the calendar view
2. Correctly calculate invoice totals based on the copied attendance data
3. Show the attendance in the PDF invoice

## Future Improvements
For a future update, consider implementing a smart system that can:
1. Handle different days/formats between months (bank holidays, nursery closures, etc.)
2. Calculate the most cost-effective way to utilize free session entitlements
3. Optimize invoice calculations based on attendance patterns
