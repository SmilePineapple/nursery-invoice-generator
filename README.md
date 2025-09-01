# Nursery Invoice Generator

A simple web application for nursery staff to create printable monthly invoices for children based on attendance. The application allows for tracking attendance, applying government-funded free hours for 3-4 year olds, and generating professional invoices.

## Features

- Child setup with age group selection
- Visual attendance input table with interactive calendar view
- Automatic pricing calculation with Early Years Entitlement support
- Professional PDF invoice generation with custom format
- Weekly attendance breakdown in invoices
- Clear attendance markers ('P' for paid sessions, 'V' for Early Years Entitlement sessions)
- Export to CSV
- Configurable settings (pricing, header, footer, bank details)
- Offline functionality - no database required

## Technology Stack

- HTML5, CSS3, JavaScript
- Bootstrap 5 for UI components
- jsPDF for PDF generation
- SheetJS for CSV export
- Electron for desktop packaging

## Getting Started

### Development

1. Clone this repository
2. Open `index.html` in your browser

### Production Build

1. Install Node.js and npm
2. Run `npm install` to install dependencies
3. Run `npm run make` to build the desktop application
4. Find the packaged application in the `out` directory

## Usage

1. Set up nursery details in the Settings panel
2. Add children and their attendance for the month
3. Generate and download invoices
4. Export data or reset for the next month
