# Invoice Format Update

## Issue
The invoice format was showing each week of the month in separate tables, making the invoice unnecessarily long and harder to read. The user requested a more concise format with a single table showing the entire month organized by weeks.

## Solution
Modified the `generateInvoiceCalendarView` function in `invoices.js` to:
1. Create a single monthly table instead of multiple weekly tables
2. Show each week as a section within the single table
3. Maintain the same attendance markers ('P' for paid, 'V' for Early Years Entitlement)
4. Keep the weekly totals while adding a monthly summary at the bottom

This creates a more compact and professional invoice layout that's easier to read and print.
