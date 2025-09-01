# Invoice Preview and Calendar UI Fix

## Issues Fixed

1. **Structural Code Issues**
   - Fixed mixed code between `generateInvoiceCalendarView` and `downloadInvoicePDF` functions
   - Removed duplicate code blocks that were causing syntax errors
   - Fixed missing closing braces and properly structured the functions
   - Removed invalid HTML markup embedded in JavaScript code

2. **Calendar UI Improvements**
   - Added full month name and year as the calendar title for clarity
   - Reduced row heights and padding for a more compact UI
   - Properly calculated weeks in the month starting on Mondays
   - Added detailed attendance display by time slot with badges indicating Paid ("P") or Free ("F")
   - Added weekly totals and daily totals rows

3. **PDF Generation Fixes**
   - Fixed the `downloadInvoicePDF` function to properly generate a PDF invoice
   - Included nursery logo, nursery details, invoice summary, and attendance calendar
   - Generated an attendance calendar table in the PDF showing days Monday to Friday with attendance badges
   - Added footer with payment information and invoice footer text
   - Saved the PDF with a descriptive filename including child name and month

4. **Modal Behavior Fix**
   - Fixed the modal closing issue that was causing a blank dark screen
   - Added proper event listener cleanup for modal close events
   - Removed modal backdrop and reset body styles when modal is closed

## Technical Details

The main issue was that code from the `generateInvoiceCalendarView` function was mixed with the `downloadInvoicePDF` function, causing syntax errors and runtime issues. We separated these functions properly and ensured that each function had its own complete implementation.

We also fixed the calendar display to show the full month name instead of week numbers and reduced the row sizes to fit text height better.

The PDF download functionality now correctly generates a complete and properly formatted invoice PDF with all the necessary details.

## Testing

The application has been tested to ensure:
- Calendar displays correctly with compact rows and correct month title
- Modal closes cleanly without leaving backdrop or UI blocking issues
- PDF download generates a complete, correctly formatted invoice PDF
