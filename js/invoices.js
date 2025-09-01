// Invoices module
let currentInvoiceChildId = null;

function initInvoicesModule() {
    // Ensure pricing settings are properly initialized
    ensurePricingSettings();
    
    // Update invoices UI
    updateInvoicesUI();
    
    // Set up event listeners
    document.getElementById('generate-all-invoices-btn').addEventListener('click', generateAllInvoices);
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    document.getElementById('reset-data-btn').addEventListener('click', confirmResetData);
    document.getElementById('download-invoice-btn').addEventListener('click', downloadInvoicePDF);
    
    // Add a direct event listener for view-invoice buttons
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-invoice-btn')) {
            const childId = e.target.getAttribute('data-child-id');
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            if (child) {
                showInvoicePreview(child);
            }
        }
    });
}

// Update the invoices table UI
function updateInvoicesUI() {
    const tableBody = document.getElementById('invoices-list');
    tableBody.innerHTML = '';
    
    // Get children for current month
    const children = getCurrentMonthChildren();
    
    // Update month display in invoices section
    document.getElementById('invoice-month-display').textContent = formatMonthKey(appData.currentMonth);
    
    if (children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">No children added for ' + formatMonthKey(appData.currentMonth) + '</td>';
        tableBody.appendChild(row);
        return;
    }
    
    children.forEach(child => {
        const invoiceData = calculateInvoiceData(child);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${child.name}</td>
            <td>${child.ageGroup === 'under-3' ? 'Under 3 years' : '3-4 years'}</td>
            <td>${invoiceData.totalHours.toFixed(2)} hours</td>
            <td>${invoiceData.freeHours.toFixed(2)} hours</td>
            <td>${invoiceData.paidHours.toFixed(2)} hours</td>
            <td>${formatCurrency(invoiceData.totalAmount)}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2 view-invoice-btn" data-child-id="${child.id}">
                    View Invoice
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-invoice-btn').forEach(button => {
        button.addEventListener('click', function() {
            const childId = this.getAttribute('data-child-id');
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            if (child) {
                showInvoicePreview(child);
            }
        });
    });
}

// Calculate invoice data for a child
function calculateInvoiceData(child) {
    let totalHours = 0;
    let freeHours = 0;
    let paidHours = 0;
    let totalAmount = 0;
    
    // Check if the child has calendar attendance data
    if (child.calendarAttendance && child.calendarAttendance[appData.currentMonth]) {
        // Get the month and year from the current month key (format: YYYY-MM)
        const [year, month] = appData.currentMonth.split('-').map(Number);
        
        // Get the number of days in the month
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // For each day in the month
        for (let day = 1; day <= daysInMonth; day++) {
            // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            
            // Skip weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;
            
            // Get attendance data for this day
            const dayAttendance = child.calendarAttendance[appData.currentMonth][day] || {};
            
            // For each time slot
            ['early', 'morning', 'lunch', 'afternoon', 'late'].forEach(slot => {
                // Get attendance type for this slot
                const attendanceType = dayAttendance[slot];
                
                // If attending this slot
                if (attendanceType) {
                    // Get slot duration
                    const slotDuration = getSlotDuration(slot);
                    
                    // Add to total hours
                    totalHours += slotDuration;
                    
                    // Add to free or paid hours based on attendance type
                    if (attendanceType === 'free') {
                        freeHours += slotDuration;
                    } else if (attendanceType === 'paid') {
                        paidHours += slotDuration;
                        
                        // Calculate cost for this slot
                        let slotCost = 0;
                        if (slot === 'early') {
                            slotCost = slotDuration * appData.settings.pricing.early;
                            console.log(`calculateInvoiceData - Early slot: rate=${appData.settings.pricing.early}, duration=${slotDuration}, cost=${slotCost}`);
                        } else if (slot === 'late') {
                            // Late slot is a flat fee, not hourly
                            slotCost = appData.settings.pricing.late;
                            console.log(`calculateInvoiceData - Late slot: flat fee=${appData.settings.pricing.late}`);
                        } else {
                            slotCost = slotDuration * appData.settings.pricing.standard;
                            console.log(`calculateInvoiceData - ${slot} slot: rate=${appData.settings.pricing.standard}, duration=${slotDuration}, cost=${slotCost}`);
                        }
                        
                        // Add to total amount
                        totalAmount += slotCost;
                    }
                }
            });
        }
    }
    
    return {
        totalHours,
        freeHours,
        paidHours,
        totalAmount
    };
}

// Show invoice preview for a child
function showInvoicePreview(child) {
    try {
        console.log('Showing invoice preview for child:', child.name);
        
        // Get the modal element
        const modalElement = document.getElementById('invoice-preview-modal');
        if (!modalElement) {
            console.error('Invoice preview modal not found');
            alert('Error: Invoice preview modal not found');
            return;
        }
        const invoiceSummaryContainer = document.getElementById('invoice-summary-container');
        if (!invoiceSummaryContainer) {
            console.error('Error: Invoice summary container not found');
            alert('Error: Invoice summary container not found');
            return;
        }
        
        // Set current child ID for invoice operations
        currentInvoiceChildId = child.id;
        
        // Calculate invoice data
        const invoiceData = calculateInvoiceData(child);
        
        // Update invoice summary
        console.log('Updating invoice preview for child:', child.name);
        
        // Ensure child name is displayed in the summary
        const childNameElement = document.getElementById('invoice-child-name');
        if (childNameElement) {
            childNameElement.textContent = child.name;
            console.log('Updated invoice-child-name element with:', child.name);
        } else {
            console.error('invoice-child-name element not found');
        }
        
        document.getElementById('invoice-month').textContent = formatMonthKey(appData.currentMonth);
        document.getElementById('invoice-age-group').textContent = child.ageGroup === 'under-3' ? 'Under 3 years' : '3-4 years';
        document.getElementById('invoice-total-hours').textContent = invoiceData.totalHours.toFixed(2) + ' hours';
        document.getElementById('invoice-free-hours').textContent = invoiceData.freeHours.toFixed(2) + ' hours';
        document.getElementById('invoice-paid-hours').textContent = invoiceData.paidHours.toFixed(2) + ' hours';
        document.getElementById('invoice-total-amount').textContent = formatCurrency(invoiceData.totalAmount);
        
        // Update child name in title
        const titleElement = document.getElementById('invoice-title-child-name');
        if (titleElement) {
            titleElement.textContent = child.name;
            console.log('Updated invoice-title-child-name element with:', child.name);
        } else {
            console.error('invoice-title-child-name element not found');
        }
        
        // Update nursery details
        if (appData.settings.nursery.logo) {
            document.getElementById('invoice-nursery-logo').src = appData.settings.nursery.logo;
            document.getElementById('nursery-logo-container').classList.remove('d-none');
        } else {
            document.getElementById('nursery-logo-container').classList.add('d-none');
        }
        document.getElementById('invoice-nursery-name').textContent = appData.settings.nursery.name || 'Nursery Name';
        document.getElementById('invoice-nursery-address').textContent = appData.settings.nursery.address || 'Nursery Address';
        document.getElementById('invoice-nursery-contact').textContent = appData.settings.nursery.contact || 'Contact Information';
        
        // Update payment details
        console.log('Bank details:', appData.settings.invoice.bankDetails);
        const bankDetailsElement = document.getElementById('invoice-bank-details');
        if (bankDetailsElement) {
            // Make sure we're displaying a string, not a boolean
            const bankDetailsText = typeof appData.settings.invoice.bankDetails === 'string' 
                ? appData.settings.invoice.bankDetails 
                : 'Bank details not provided';
            bankDetailsElement.innerHTML = bankDetailsText;
            console.log('Updated bank details element with:', bankDetailsText);
        } else {
            console.error('invoice-bank-details element not found');
        }
        
        // Calculate the actual payment due date based on the invoice month
        const paymentDueDay = appData.settings.invoice.paymentDueDay || 15;
        const dueDateSuffix = getDaySuffix(paymentDueDay);
        
        // Parse the current month to get year and month
        const [year, month] = appData.currentMonth.split('-');
        
        // Create a date object for the invoice month
        const invoiceDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        
        // Get the last day of the month
        const lastDayOfMonth = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 0).getDate();
        
        // Determine the actual due date (use the last day of month if paymentDueDay exceeds it)
        const actualDueDay = Math.min(paymentDueDay, lastDayOfMonth);
        const actualDueDateSuffix = getDaySuffix(actualDueDay);
        
        // Format the full date for clarity
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDueDate = `${actualDueDay}${actualDueDateSuffix} ${monthNames[invoiceDate.getMonth()]} ${invoiceDate.getFullYear()}`;
        
        // Create payment due message
        const paymentDueMessage = `<strong>Payment Due Date:</strong> ${formattedDueDate}`;
        
        // Combine payment due message with any additional footer text
        const additionalFooter = appData.settings.invoice.footer ? `<div class="mt-2">${appData.settings.invoice.footer}</div>` : '';
        document.getElementById('invoice-notes').innerHTML = paymentDueMessage + additionalFooter;
        
        // Generate calendar view
        generateInvoiceCalendarView(child);
        
        // Set up download button event listener
        const downloadBtn = document.getElementById('download-invoice-btn');
        if (downloadBtn) {
            // Remove any existing event listeners
            const newDownloadBtn = downloadBtn.cloneNode(true);
            downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
            
            // Add new event listener
            newDownloadBtn.addEventListener('click', function() {
                downloadInvoicePDF();
            });
        }
        
        // Show modal
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Fix for modal backdrop issue
        modalElement.addEventListener('hidden.bs.modal', function() {
            // Remove modal backdrop if it exists
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            // Remove modal-open class from body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    } catch (error) {
        console.error('Error showing invoice preview:', error);
        alert('Error showing invoice preview: ' + error.message);
    }
}

// Generate invoice calendar view with professional styling
function generateInvoiceCalendarView(child) {
    try {
        console.log('Generating invoice calendar view for child:', child.name);
        
        // Get the calendar container
        const calendarContainer = document.getElementById('invoice-calendar-container');
        if (!calendarContainer) {
            console.error('Calendar container not found');
            return;
        }
        
        // Clear the container
        calendarContainer.innerHTML = '';
        
        // Get current month and year
        const [year, month] = appData.currentMonth.split('-').map(Number);
        const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
        
        // Create month title
        const monthTitle = document.createElement('h5');
        monthTitle.className = 'text-center mb-3';
        monthTitle.textContent = `${monthName} ${year}`;
        calendarContainer.appendChild(monthTitle);
        
        // Define time slots
        const timeSlots = [
            { id: 'early', name: 'Early (7:30-9:00)' },
            { id: 'morning', name: 'Morning (9:00-12:00)' },
            { id: 'lunch', name: 'Lunch (12:00-13:00)' },
            { id: 'afternoon', name: 'Afternoon (13:00-15:30)' },
            { id: 'late', name: 'Late (15:30-18:00)' }
        ];
        
        // Get days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Create a calendar structure organized by weeks
        const weeks = [];
        let currentWeek = [];
        let weekTotal = 0;
        let grandTotal = 0;
        
        // Initialize the first week with empty days until the first day of the month
        const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
        const firstWeekdayIndex = firstDay === 0 ? 6 : firstDay - 1; // Convert to 0 = Monday, ..., 6 = Sunday
        
        for (let i = 0; i < firstWeekdayIndex; i++) {
            currentWeek.push(null); // Empty days before the 1st of the month
        }
        
        // Fill in all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Skip weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }
            
            // Add the day to the current week
            currentWeek.push({
                day,
                date,
                attendance: child.calendarAttendance?.[appData.currentMonth]?.[day] || {}
            });
            
            // If it's Friday or the last day of the month, end the week
            if (dayOfWeek === 5 || day === daysInMonth) {
                // If the week isn't complete (not ending on Friday), add empty days
                while (currentWeek.length < 5) {
                    currentWeek.push(null); // Empty days after the end of the month
                }
                
                // Add the week to the list of weeks
                weeks.push({
                    days: currentWeek,
                    total: 0 // Will calculate this later
                });
                
                // Start a new week
                currentWeek = [];
            }
        }
        
        // If there's a partial week at the end, add it
        if (currentWeek.length > 0) {
            // Fill in empty days to complete the week
            while (currentWeek.length < 5) {
                currentWeek.push(null);
            }
            
            weeks.push({
                days: currentWeek,
                total: 0
            });
        }
        
        // Create a container for all weekly tables
        const weeklyTablesContainer = document.createElement('div');
        weeklyTablesContainer.className = 'weekly-tables';
        
        // Day names for table headers
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // For each week, create a separate table
        weeks.forEach((week, weekIndex) => {
            // Calculate week dates range for the header
            const firstDayInWeek = week.days.find(day => day !== null);
            const lastDayInWeek = [...week.days].reverse().find(day => day !== null);
            
            if (!firstDayInWeek || !lastDayInWeek) {
                return; // Skip weeks with no valid days
            }
            
            // Create week header
            const weekHeader = document.createElement('h6');
            weekHeader.className = 'text-center mt-4 mb-2';
            weekHeader.textContent = `Week ${weekIndex + 1}: ${firstDayInWeek.day} - ${lastDayInWeek.day} ${monthName}`;
            weeklyTablesContainer.appendChild(weekHeader);
            
            // Create table for this week
            const table = document.createElement('table');
            table.className = 'table table-bordered table-sm weekly-table';
            table.style.fontSize = '0.85rem';
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
            table.style.marginBottom = '1.5rem';
            table.style.borderCollapse = 'collapse';
            
            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.style.lineHeight = '1.2';
            
            // Add time slot header
            const timeSlotHeader = document.createElement('th');
            timeSlotHeader.textContent = 'Time Slot';
            headerRow.appendChild(timeSlotHeader);
            
            // Add day headers
            dayNames.forEach((dayName, dayIndex) => {
                const th = document.createElement('th');
                const day = week.days[dayIndex];
                
                if (day) {
                    th.textContent = `${dayName} ${day.day}`;
                } else {
                    th.textContent = dayName;
                    th.style.color = '#ccc'; // Gray out days outside the month
                }
                
                headerRow.appendChild(th);
            });
            
            // Add weekly total header
            const weeklyTotalHeader = document.createElement('th');
            weeklyTotalHeader.textContent = 'Weekly Total';
            weeklyTotalHeader.style.fontWeight = 'bold';
            weeklyTotalHeader.style.backgroundColor = '#f8f9fa';
            headerRow.appendChild(weeklyTotalHeader);
            
            // Add header row to table
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create table body
            const tbody = document.createElement('tbody');
            
            // Track totals for this week
            let weekTotal = 0;
            const dailyTotals = Array(5).fill(0); // One total for each day of the week
            
            // Create rows for each time slot
            timeSlots.forEach(timeSlot => {
                const row = document.createElement('tr');
                row.style.lineHeight = '1';
                
                // Add time slot name
                const slotNameCell = document.createElement('td');
                slotNameCell.textContent = timeSlot.name;
                slotNameCell.style.fontWeight = 'bold';
                row.appendChild(slotNameCell);
                
                // Track weekly total for this slot
                let slotWeeklyTotal = 0;
                
                // Add cells for each day
                week.days.forEach((day, dayIndex) => {
                    const cell = document.createElement('td');
                    cell.className = 'text-center';
                    cell.style.padding = '0.25rem';
                    
                    // If this is a valid day in the month
                    if (day) {
                        // Get attendance for this day and slot
                        const attendanceType = day.attendance[timeSlot.id];
                        
                        // Only show badges for actual attendance (paid or free)
                        // This fixes the issue with Friday showing V badges when it should be blank
                        if (attendanceType && attendanceType !== '-') {
                            // Create badge
                            const badge = document.createElement('div');
                            badge.className = `attendance-badge ${attendanceType}`;
                            badge.textContent = attendanceType === 'paid' ? 'P' : 'V';
                            badge.title = attendanceType === 'paid' ? 'Paid attendance' : 'Voucher (Early Years Funded) attendance';
                            cell.appendChild(badge);
                            
                            // Calculate amount if paid (but don't display in daily cells)
                            if (attendanceType === 'paid') {
                                // Get slot duration
                                const slotDuration = getSlotDuration(timeSlot.id);
                                
                                // Calculate amount based on slot
                                let amount;
                                if (timeSlot.id === 'early') {
                                    const rate = appData.settings.pricing.early;
                                    amount = rate * slotDuration;
                                    console.log(`Early slot rate: ${rate}, duration: ${slotDuration}, total: ${amount}`);
                                } else if (timeSlot.id === 'late') {
                                    // Late slot is a flat fee, not hourly
                                    amount = appData.settings.pricing.late;
                                    console.log(`Late slot: flat fee of ${amount}`);
                                } else {
                                    const rate = appData.settings.pricing.standard;
                                    amount = rate * slotDuration;
                                    console.log(`Standard slot (${timeSlot.id}) rate: ${rate}, duration: ${slotDuration}, total: ${amount}`);
                                }
                                slotWeeklyTotal += amount;
                                dailyTotals[dayIndex] += amount;
                                weekTotal += amount;
                                grandTotal += amount;
                                
                                // No longer display amount in daily cells
                                // Only the badge 'P' will be shown
                            }
                        } else {
                            cell.textContent = ''; // Empty cell instead of '-'
                        }
                    } else {
                        cell.textContent = ''; // Empty cell instead of '-'
                        cell.style.backgroundColor = '#f9f9f9'; // Light gray background for days outside the month
                    }
                    
                    row.appendChild(cell);
                });
                
                // Add weekly total for this slot
                const totalCell = document.createElement('td');
                totalCell.className = 'text-end';
                totalCell.textContent = formatCurrency(slotWeeklyTotal);
                totalCell.style.fontWeight = 'bold';
                totalCell.style.backgroundColor = '#f8f9fa';
                totalCell.style.borderLeft = '2px solid #dee2e6';
                row.appendChild(totalCell);
                
                // Add row to table
                tbody.appendChild(row);
            });
            
            // Add daily totals row
            const dailyTotalsRow = document.createElement('tr');
            dailyTotalsRow.className = 'daily-totals';
            
            // Add header cell
            const dailyTotalsHeader = document.createElement('th');
            dailyTotalsHeader.textContent = 'Daily Totals';
            dailyTotalsHeader.style.fontWeight = 'bold';
            dailyTotalsHeader.style.backgroundColor = '#f8f9fa';
            dailyTotalsRow.appendChild(dailyTotalsHeader);
            
            // Add daily total cells
            dailyTotals.forEach((total, index) => {
                const cell = document.createElement('th');
                cell.className = 'text-end';
                cell.textContent = formatCurrency(total);
                cell.style.fontWeight = 'bold';
                cell.style.backgroundColor = '#f8f9fa';
                dailyTotalsRow.appendChild(cell);
            });
            
            // Add weekly total cell
            const weeklyTotalCell = document.createElement('th');
            weeklyTotalCell.className = 'text-end';
            weeklyTotalCell.textContent = formatCurrency(weekTotal);
            weeklyTotalCell.style.fontWeight = 'bold';
            weeklyTotalCell.style.backgroundColor = '#e9ecef';
            dailyTotalsRow.appendChild(weeklyTotalCell);
            
            // Add daily totals row to table
            tbody.appendChild(dailyTotalsRow);
            
            // Add table body to table
            table.appendChild(tbody);
            
            // Add table to weekly tables container
            weeklyTablesContainer.appendChild(table);
            
            // Store the week total
            week.total = weekTotal;
        });
        
        // Add weekly tables container to calendar container
        calendarContainer.appendChild(weeklyTablesContainer);
        
        // Add grand total section
        const grandTotalSection = document.createElement('div');
        grandTotalSection.className = 'grand-total-section mt-4';
        
        const grandTotalHeader = document.createElement('h5');
        grandTotalHeader.className = 'text-end';
        grandTotalHeader.textContent = `Grand Total: ${formatCurrency(grandTotal)}`;
        grandTotalSection.appendChild(grandTotalHeader);
        
        calendarContainer.appendChild(grandTotalSection);
        
        // Add legend with pricing information
        const legend = document.createElement('div');
        legend.className = 'invoice-legend mt-4 p-3 border rounded bg-light';
        
        // Create legend header
        const legendHeader = document.createElement('h5');
        legendHeader.className = 'mb-3';
        legendHeader.textContent = 'Legend & Pricing Information';
        legend.appendChild(legendHeader);
        
        // Create attendance legend
        const attendanceLegend = document.createElement('div');
        attendanceLegend.className = 'mb-3';
        attendanceLegend.innerHTML = `
            <p><span class="legend-item paid">P</span> = Paid Session</p>
            <p><span class="legend-item free">V</span> = Sessions covered by the Early Years Entitlement</p>
        `;
        legend.appendChild(attendanceLegend);
        
        // Add pricing information
        const pricingInfo = document.createElement('div');
        pricingInfo.className = 'pricing-info mt-3 pt-3 border-top';
        
        const pricingHeader = document.createElement('h6');
        pricingHeader.className = 'mb-2';
        pricingHeader.textContent = 'Current Pricing Structure:';
        pricingInfo.appendChild(pricingHeader);
        
        const pricingList = document.createElement('ul');
        pricingList.className = 'list-unstyled';
        pricingList.innerHTML = `
            <li>Early Morning (7:30-9:00): ${formatCurrency(appData.settings.pricing.early)}/hour</li>
            <li>Standard Hours (9:00-15:00): ${formatCurrency(appData.settings.pricing.standard)}/hour</li>
            <li>Late Afternoon (15:30-18:00): ${formatCurrency(appData.settings.pricing.late)} flat fee</li>
        `;
        pricingInfo.appendChild(pricingList);
        
        legend.appendChild(pricingInfo);
        calendarContainer.appendChild(legend);
        
        // Add footer
        const footer = document.createElement('div');
        footer.className = 'invoice-footer mt-4';
        
        // Add payment details
        const paymentDetails = document.createElement('div');
        paymentDetails.className = 'payment-details';
        paymentDetails.innerHTML = `
            <h4>Payment Details</h4>
            <p>${appData.settings.invoice.bankDetails || 'Please contact the nursery for payment details.'}</p>
        `;
        footer.appendChild(paymentDetails);
        
        // Add footer text
        const footerText = document.createElement('div');
        footerText.className = 'footer-text mt-3';
        footerText.innerHTML = `
            <p>${appData.settings.invoice.footer || 'Thank you for your business.'}</p>
        `;
        footer.appendChild(footerText);
        
        // Add accreditations
        const accreditations = document.createElement('div');
        accreditations.className = 'accreditation mt-3';
        accreditations.innerHTML = `
            <img src="img/learning-excellence.png" alt="Learning Excellence Award">
            <img src="img/ofsted.png" alt="Ofsted Outstanding">
        `;
        footer.appendChild(accreditations);
        
        // Add footer to calendar container
        calendarContainer.appendChild(footer);
        
        console.log('Invoice calendar view generated successfully with weekly tables');
        
    } catch (error) {
        console.error('Error generating invoice calendar view:', error);
        alert('Error generating invoice preview. Please try again.');
    }
}

// Helper function to calculate date from week and day of week
function calculateDateFromWeekAndDay(year, month, weekOfMonth, dayOfWeek) {
    // Get the first day of the month
    const firstDay = new Date(year, month - 1, 1);
    
    // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate the date of the first occurrence of the specified day of the week
    let firstOccurrence = ((dayOfWeek - firstDayOfWeek + 7) % 7) + 1;
    
    // Calculate the date of the specified week and day
    const date = firstOccurrence + (7 * (weekOfMonth - 1));
    
    return date;
}

// Helper function to get slot name
function getSlotName(slot) {
    switch(slot) {
        case 'early': return '7:45 - 9:00';
        case 'morning': return '9:00 - 11:30';
        case 'lunch': return '11:30 - 13:00';
        case 'afternoon': return '13:00 - 15:00';
        case 'late': return '15:00 - 17:30';
        default: return '';
    }
}

// Helper function to get week of month
function getWeekOfMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days from first day of month to first Monday
    const daysToFirstMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
    
    // Calculate week number
    const dayOfMonth = date.getDate();
    if (dayOfMonth < daysToFirstMonday) {
        return 1; // First partial week
    }
    
    return Math.ceil((dayOfMonth - daysToFirstMonday + 1) / 7) + 1;
}

// Helper function to get attendance for a specific day
function getAttendanceForDay(child, day) {
    if (!child.calendarAttendance || !child.calendarAttendance[appData.currentMonth] || !child.calendarAttendance[appData.currentMonth][day]) {
        return {};
    }
    
    return child.calendarAttendance[appData.currentMonth][day];
}

// Helper function to get slot duration
function getSlotDuration(slot) {
    // Log the slot being checked
    console.log(`Getting duration for slot: ${slot}`);
    
    let duration;
    switch(slot) {
        case 'early': duration = 1.5; break; // 7:30 - 9:00 = 1.5 hours
        case 'morning': duration = 3.0; break; // 9:00 - 12:00 = 3.0 hours
        case 'lunch': duration = 1.0; break; // 12:00 - 13:00 = 1.0 hours
        case 'afternoon': duration = 2.0; break; // 13:00 - 15:00 = 2.0 hours
        case 'late': duration = 2.5; break; // 15:30 - 18:00 = 2.5 hours
        default: duration = 0;
    }
    
    console.log(`Slot ${slot} has duration: ${duration} hours`);
    return duration;
}

// Download invoice as PDF
function downloadInvoicePDF() {
    try {
        // Get the current child
        if (!currentInvoiceChildId) {
            console.error('No child selected for invoice');
            return;
        }
        
        const child = getCurrentMonthChildren().find(c => c.id === currentInvoiceChildId);
        if (!child) {
            console.error('Child not found for invoice');
            return;
        }
        
        // Calculate invoice data
        const invoiceData = calculateInvoiceData(child);
        
        // Create a new jsPDF instance
        const doc = new jspdf.jsPDF();
        
        // Add nursery logo and calculate positioning
        let nurseryDetailsStartY = 20; // Default position without logo
        
        if (appData.settings.nursery.logo) {
            doc.addImage(appData.settings.nursery.logo, 'JPEG', 10, 10, 50, 30);
            nurseryDetailsStartY = 45; // Position details below logo
        }
        
        // Add nursery details with proper spacing based on logo presence
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185); // Primary blue color
        doc.setFont(undefined, 'bold');
        doc.text(appData.settings.nursery.name || 'Nursery Name', 15, nurseryDetailsStartY);
        
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(appData.settings.nursery.address || 'Nursery Address', 15, nurseryDetailsStartY + 8);
        doc.text(appData.settings.nursery.contact || 'Nursery Contact', 15, nurseryDetailsStartY + 14);
        
        // Add invoice details in a styled box with proper spacing
        const invoiceBoxY = appData.settings.nursery.logo ? 15 : 15; // Keep box at top right
        doc.setDrawColor(41, 128, 185); // Primary blue for border
        doc.setFillColor(245, 245, 245); // Light gray background
        doc.rect(120, invoiceBoxY, 75, 40, 'FD'); // Increased height to accommodate Total field
        
        // Child and invoice details with better positioning
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text(`Child:`, 125, 25);
        doc.setFont(undefined, 'normal');
        doc.text(`${child.name}`, 145, 25);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Month:`, 125, 30);
        doc.setFont(undefined, 'normal');
        doc.text(`${formatMonthKey(appData.currentMonth)}`, 145, 30);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Date:`, 125, 35);
        doc.setFont(undefined, 'normal');
        doc.text(`${new Date().toLocaleDateString()}`, 145, 35);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Invoice #:`, 125, 40);
        doc.setFont(undefined, 'normal');
        doc.text(`${child.id.substring(0, 8)}-${appData.currentMonth}`, 145, 40);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Total:`, 125, 45);
        doc.setFont(undefined, 'normal');
        console.log('Invoice data for PDF:', invoiceData);
        doc.text(`£${invoiceData.totalAmount.toFixed(2)}`, 145, 45);
        
        // Invoice Summary section removed as requested
        
        // Calculate starting position for calendar based on header height - much reduced gap
        const calendarStartY = appData.settings.nursery.logo ? 55 : 40; // Much smaller gap to fit on one page
        
        // Get the month and year
        const [calYear, calMonth] = appData.currentMonth.split('-').map(Number);
        const monthName = new Date(calYear, calMonth - 1, 1).toLocaleString('default', { month: 'long' });
        
        // Calculate the number of days in the month
        const daysInMonth = new Date(calYear, calMonth, 0).getDate();
        
        // Add month and year as subtitle - positioned based on logo
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text(`${monthName} ${calYear}`, 18, calendarStartY + 15);
        
        // Create weekly attendance calendar data like in the preview
        const timeSlots = ['early', 'morning', 'lunch', 'afternoon', 'late'];
        const slotLabels = {
            early: 'Early (7:30-9:00)',
            morning: 'Morning (9:00-12:00)',
            lunch: 'Lunch (12:00-13:00)',
            afternoon: 'Afternoon (13:00-15:30)',
            late: 'Late (15:30-18:00)'
        };
        
        // Get days in month and organize by weeks
        const weeks = [];
        let currentWeek = [];
        
        // Calculate the first weekday of the month (0 = Sunday, 1 = Monday, etc.)
        const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
        const firstWeekdayIndex = firstDay === 0 ? 6 : firstDay - 1; // Convert to 0 = Monday, ..., 6 = Sunday
        
        // Initialize the first week with empty days until the first day of the month
        for (let i = 0; i < firstWeekdayIndex; i++) {
            currentWeek.push(null); // Empty days before the 1st of the month
        }
        
        // Fill in all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(calYear, calMonth - 1, day);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Skip weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }
            
            // Add the day to the current week
            currentWeek.push({
                day,
                date,
                attendance: child.calendarAttendance?.[appData.currentMonth]?.[day] || {}
            });
            
            // If it's Friday or the last day of the month, end the week
            if (dayOfWeek === 5 || day === daysInMonth) {
                // If the week isn't complete (not ending on Friday), add empty days
                while (currentWeek.length < 5) {
                    currentWeek.push(null); // Empty days after the end of the month
                }
                
                // Add the week to the list of weeks
                weeks.push({
                    days: currentWeek,
                    weekNumber: weeks.length + 1
                });
                
                // Start a new week
                currentWeek = [];
            }
        }
        
        // If there's a partial week at the end, add it
        if (currentWeek.length > 0) {
            // Fill in empty days to complete the week
            while (currentWeek.length < 5) {
                currentWeek.push(null);
            }
            weeks.push({
                days: currentWeek,
                weekNumber: weeks.length + 1
            });
        }
        
        // Calculate starting Y position for the first week - proper spacing after header
        let startY = calendarStartY + 20; // Dynamic positioning based on logo presence
        let finalY = startY;
        
        // Draw each week as a separate table
        weeks.forEach((week, weekIndex) => {
            // Week header removed as requested
            if (weekIndex > 0) {
                startY = finalY + 1; // Reduced gap between weeks from 5 to 1
            }
            
            // Add week title
            // Removed week title as requested
            
            // Create table data for this week
            const weekData = [];
            
            // Add header row with days of week
            const headerRow = ['Time Slot'];
            week.days.forEach((day, index) => {
                const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                if (day) {
                    headerRow.push(`${dayNames[index]} ${day.day}`);
                } else {
                    headerRow.push(dayNames[index]);
                }
            });
            headerRow.push('Weekly Total');
            weekData.push(headerRow);
            
            // Calculate totals for each time slot
            const weeklyTotals = {};
            timeSlots.forEach(slot => {
                const row = [slotLabels[slot]];
                let slotTotal = 0;
                
                // Add attendance for each day
                week.days.forEach(day => {
                    if (day) {
                        const attendanceType = day.attendance[slot];
                        if (attendanceType) {
                            // Add P or V based on attendance type
                            row.push(attendanceType === 'paid' ? 'P' : 'V');
                            
                            // Calculate cost based on attendance type and slot
                            let slotCost = 0;
                            if (attendanceType === 'paid') {
                                switch(slot) {
                                    case 'early': slotCost = 5.00; break;
                                    case 'morning': slotCost = 5.30; break;
                                    case 'lunch': slotCost = 5.30; break;
                                    case 'afternoon': slotCost = 5.30; break;
                                    case 'late': slotCost = 10.00; break;
                                }
                            }
                            slotTotal += slotCost;
                        } else {
                            row.push('');
                        }
                    } else {
                        row.push('');
                    }
                });
                
                // Add weekly total for this time slot with bold formatting
                row.push({content: slotTotal > 0 ? `£${slotTotal.toFixed(2)}` : '£0.00', styles: {fontStyle: 'bold', fillColor: [240, 240, 240]}});
                weekData.push(row);
                
                // Store the total for this slot
                weeklyTotals[slot] = slotTotal;
            });
            
            // Add daily totals row
            const dailyTotalsRow = [{content: 'Daily Totals', styles: {fontStyle: 'bold', fillColor: [230, 230, 230]}}];
            let weekGrandTotal = 0;
            
            week.days.forEach(day => {
                if (day) {
                    let dayTotal = 0;
                    timeSlots.forEach(slot => {
                        const attendanceType = day.attendance[slot];
                        if (attendanceType === 'paid') {
                            switch(slot) {
                                case 'early': dayTotal += 5.00; break;
                                case 'morning': dayTotal += 5.30; break;
                                case 'lunch': dayTotal += 5.30; break;
                                case 'afternoon': dayTotal += 5.30; break;
                                case 'late': dayTotal += 10.00; break;
                            }
                        }
                    });
                    dailyTotalsRow.push({content: `£${dayTotal.toFixed(2)}`, styles: {fontStyle: 'bold', fillColor: [230, 230, 230]}});
                    weekGrandTotal += dayTotal;
                } else {
                    dailyTotalsRow.push({content: '£0.00', styles: {fontStyle: 'bold', fillColor: [230, 230, 230]}});
                }
            });
            
            // Add weekly grand total in bold
            dailyTotalsRow.push({content: `£${weekGrandTotal.toFixed(2)}`, styles: {fontStyle: 'bold', fillColor: [200, 200, 200]}});
            weekData.push(dailyTotalsRow);
            
            // Add the week table to the PDF with consistent alignment
            doc.autoTable({
                head: [weekData[0]],
                body: weekData.slice(1),
                startY: startY + 1,
                margin: { left: 5, right: 5 },
                theme: 'plain',
                tableWidth: 200,
                tableLineWidth: 0.5,
                tableLineColor: [100, 100, 100],
                headStyles: { 
                    fillColor: [245, 245, 245], // Changed from blue to light gray
                    textColor: 0, // Changed from white to black
                    fontStyle: 'bold',
                    halign: 'center',
                    fontSize: 7
                },
                styles: { 
                    fontSize: 7, 
                    cellPadding: 1,
                    lineColor: [100, 100, 100], // Darker line color for more prominent borders
                    lineWidth: 0.5, // Increased from default to make borders more prominent
                    halign: 'center',
                    fillColor: [255, 255, 255] // Ensure white background for all cells
                },
                columnStyles: {
                    0: { fontStyle: 'bold', fillColor: [245, 245, 245], halign: 'left', cellWidth: 40 }, // Time column
                    1: { fillColor: [255, 255, 255], halign: 'center', cellWidth: 24 }, // Monday
                    2: { fillColor: [255, 255, 255], halign: 'center', cellWidth: 24 }, // Tuesday
                    3: { fillColor: [255, 255, 255], halign: 'center', cellWidth: 24 }, // Wednesday
                    4: { fillColor: [255, 255, 255], halign: 'center', cellWidth: 24 }, // Thursday
                    5: { fillColor: [255, 255, 255], halign: 'center', cellWidth: 24 }, // Friday
                    [weekData[0].length - 1]: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right', cellWidth: 28 } // Weekly Total
                },
                // Remove blue border around weeks
                drawCell: function(cell, data) {
                    // Remove the default border drawing for the outer edges
                    if (cell.section === 'head') {
                        // Don't draw any special border for header cells
                        return false; // Return false to use default drawing
                    }
                    return false; // Use default for all other cells
                },
                didDrawCell: function(data) {
                    // Highlight P and V cells
                    if (data.cell.text === 'P') {
                        doc.setFillColor(0, 123, 255); // Blue for paid
                        doc.circle(data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, 2.5, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(6);
                        doc.text('P', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, {align: 'center'});
                    } else if (data.cell.text === 'V') {
                        doc.setFillColor(40, 167, 69); // Green for voucher
                        doc.circle(data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, 2.5, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(6);
                        doc.text('V', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, {align: 'center'});
                    }
                }
            });
            
            // Update finalY to the bottom of this table
            finalY = doc.lastAutoTable.finalY;
        });
        
        // Add total invoice cost
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        
        // Calculate total invoice cost from all weeks
        let totalInvoiceCost = 0;
        weeks.forEach(week => {
            week.days.forEach(day => {
                if (day) {
                    timeSlots.forEach(slot => {
                        const attendanceType = day.attendance[slot];
                        if (attendanceType === 'paid') {
                            switch(slot) {
                                case 'early': totalInvoiceCost += 5.00; break;
                                case 'morning': totalInvoiceCost += 5.30; break;
                                case 'lunch': totalInvoiceCost += 5.30; break;
                                case 'afternoon': totalInvoiceCost += 5.30; break;
                                case 'late': totalInvoiceCost += 10.00; break;
                            }
                        }
                    });
                }
            });
        });
        
        // Display total invoice cost
        doc.text(`Total Invoice Amount: £${totalInvoiceCost.toFixed(2)}`, 18, finalY + 7);
        
        // Add legend for P and V
        doc.setFontSize(7);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(0, 0, 0);
        doc.text('Legend:', 110, finalY + 7);
        
        // Draw P legend
        doc.setFillColor(0, 123, 255); // Blue for paid
        doc.circle(125, finalY + 7, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text('P', 125, finalY + 9, {align: 'center'});
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.text('= Paid Session', 130, finalY + 7);
        
        // Draw V legend
        doc.setFillColor(40, 167, 69); // Green for voucher
        doc.circle(160, finalY + 7, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text('V', 160, finalY + 9, {align: 'center'});
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.text('= Voucher', 165, finalY + 7);
        
        // Add footer with payment information - styled like the card in the preview
        // Reduce the gap between attendance calendar and payment section
        const paymentY = finalY + 10; // Reduced from 20 to 10
        
        // Draw card border and header - changed from blue to gray
        doc.setDrawColor(100, 100, 100); // Gray border instead of blue
        doc.setFillColor(245, 245, 245); // Light gray header instead of blue
        doc.setLineWidth(0.5);
        
        // Card header
        doc.rect(14, paymentY, 182, 8, 'F'); // Filled rectangle for header
        doc.setTextColor(0, 0, 0); // Black text for header instead of white
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Payment Details', 18, paymentY + 5.5);
        
        // Card body - further reduced height
        doc.setFillColor(255, 255, 255); // White background
        doc.rect(14, paymentY + 8, 182, 20, 'FD'); // Further reduced height from 25 to 20
        
        // Reset text color to black
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        
        // Left column - Bank Information
        doc.text('Bank Information', 18, paymentY + 14);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        
        // Draw light gray background for bank details - further reduced height
        doc.setFillColor(245, 245, 245); // Light gray
        doc.rect(18, paymentY + 16, 80, 10, 'F'); // Further reduced height from 14 to 10
        
        // Add bank details text with word wrapping
        const bankDetailsText = typeof appData.settings.invoice.bankDetails === 'string' 
            ? appData.settings.invoice.bankDetails 
            : 'Please make payment to the account details provided separately.';
        
        doc.text(bankDetailsText, 20, paymentY + 20, { 
            maxWidth: 76,
            align: 'left'
        });
        
        // Right column - Important Information
        doc.setFont(undefined, 'bold');
        doc.text('Important Information', 110, paymentY + 14);
        doc.setFont(undefined, 'normal');
        
        // Draw light gray background for payment notes - further reduced height
        doc.setFillColor(245, 245, 245); // Light gray
        doc.rect(110, paymentY + 16, 80, 10, 'F'); // Further reduced height from 14 to 10
        
        // Calculate the payment due date
        const paymentDueDay = appData.settings.invoice.paymentDueDay || 15;
        const [invoiceYear, invoiceMonth] = appData.currentMonth.split('-').map(Number);
        const invoiceDate = new Date(invoiceYear, invoiceMonth - 1, 1);
        const lastDayOfMonth = new Date(invoiceYear, invoiceMonth, 0).getDate();
        const actualDueDay = Math.min(paymentDueDay, lastDayOfMonth);
        
        // Format the date with suffix
        const getDaySuffix = (day) => {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDueDate = `${actualDueDay}${getDaySuffix(actualDueDay)} ${monthNames[invoiceDate.getMonth()]} ${invoiceDate.getFullYear()}`;
        
        // Add payment due date
        doc.text(`Payment Due Date: ${formattedDueDate}`, 112, paymentY + 20, {
            maxWidth: 76,
            align: 'left'
        });
        
        // Add additional footer text if available
        if (appData.settings.invoice.footer && appData.settings.invoice.footer !== 'Payment due by: ') {
            doc.text(appData.settings.invoice.footer, 112, paymentY + 25, {
                maxWidth: 76,
                align: 'left'
            });
        }
        
        // Card footer - moved up further
        doc.setFillColor(245, 245, 245); // Light gray background
        doc.rect(14, paymentY + 28, 182, 6, 'FD'); // Further reduced height and moved up
        
        // Thank you message - moved up further
        doc.setFontSize(7);
        doc.text('Thank you for your business.', 18, paymentY + 32);
        
        // Ofsted badges removed as requested
        
        // Save the PDF
        const fileName = `Invoice_${child.name.replace(/\s+/g, '_')}_${appData.currentMonth}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

// Export invoice data to CSV
function exportToCSV() {
    try {
        const children = getCurrentMonthChildren();
        if (!children || children.length === 0) {
            alert('No children found for the current month');
            return;
        }
        
        // Update UI to show export is in progress
        const exportBtn = document.getElementById('export-csv-btn');
        const originalText = exportBtn.textContent;
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...';
        
        // Create CSV content
        let csvContent = 'Child Name,Age Group,Total Hours,Free Hours,Paid Hours,Total Amount\n';
        
        children.forEach(child => {
            const invoiceData = calculateInvoiceData(child);
            const ageGroupText = child.ageGroup === 'under-3' ? 'Under 3 years' : '3-4 years';
            
            csvContent += `"${child.name}","${ageGroupText}",${invoiceData.totalHours.toFixed(2)},${invoiceData.freeHours.toFixed(2)},${invoiceData.paidHours.toFixed(2)},${invoiceData.totalAmount.toFixed(2)}\n`;
        });
        
        // Create a download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Invoices_${appData.currentMonth}.csv`);
        document.body.appendChild(link);
        
        // Download the CSV file
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        
        // Reset button state
        setTimeout(() => {
            exportBtn.disabled = false;
            exportBtn.textContent = originalText;
        }, 500);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Error exporting to CSV: ' + error.message);
    }
}

// Generate all invoices for current month
function generateAllInvoices() {
    try {
        const children = getCurrentMonthChildren();
        if (!children || children.length === 0) {
            alert('No children found for the current month');
            return;
        }
        
        // Update UI to show invoices are being generated
        const generateBtn = document.getElementById('generate-all-invoices-btn');
        const originalText = generateBtn.textContent;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
        
        // Generate invoices for all children
        setTimeout(() => {
            // Update invoices UI with all children
            updateInvoicesUI();
            
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.textContent = originalText;
            
            // Show success message
            alert(`Successfully generated invoices for ${children.length} children`);
        }, 500);
    } catch (error) {
        console.error('Error generating all invoices:', error);
        alert('Error generating all invoices: ' + error.message);
    }
}

// Confirm reset data
function confirmResetData() {
    showConfirmationModal('Are you sure you want to reset all data? This cannot be undone.', function() {
        // Reset app data
        appData = {
            currentMonth: getCurrentMonthKey(),
            months: {},
            settings: {
                pricing: {
                    early: 5.00,
                    standard: 5.30,
                    late: 10.00
                },
                nursery: {
                    name: appData.settings.nursery.name,
                    address: appData.settings.nursery.address,
                    contact: appData.settings.nursery.contact,
                    logo: appData.settings.nursery.logo
                },
                invoice: {
                    footer: appData.settings.invoice.footer,
                    bankDetails: appData.settings.invoice.bankDetails
                }
            }
        };
        
        // Initialize current month
        initializeCurrentMonth();
        
        // Save to localStorage
        saveAppData();
        
        // Update UI
        updateMonthSelectorUI();
        updateChildrenUI();
        updateInvoicesUI();
        
        // Show success message
        alert('All data has been reset successfully.');
    });
}

// Ensure pricing settings are properly initialized
function ensurePricingSettings() {
    console.log('Checking pricing settings...');
    
    // Check if pricing settings exist
    if (!appData.settings || !appData.settings.pricing) {
        console.warn('Pricing settings not found, initializing with defaults');
        appData.settings = appData.settings || {};
        appData.settings.pricing = {
            early: 5.00,
            standard: 5.30,
            late: 10.00
        };
    }
    
    // Log the current pricing settings
    console.log('Current pricing settings before validation:');
    console.log('Early rate:', appData.settings.pricing.early);
    console.log('Standard rate:', appData.settings.pricing.standard);
    console.log('Late rate:', appData.settings.pricing.late);
    
    // Validate pricing values (ensure they are numbers)
    const defaultPricing = {
        early: 5.00,
        standard: 5.30,
        late: 10.00
    };
    
    // Check each pricing value and fix if invalid
    for (const key in defaultPricing) {
        if (typeof appData.settings.pricing[key] !== 'number' || isNaN(appData.settings.pricing[key])) {
            console.warn(`Invalid pricing value for ${key}, resetting to default`);
            appData.settings.pricing[key] = defaultPricing[key];
        }
    }
    
    // Log current pricing settings
    console.log('Current pricing settings:', JSON.stringify(appData.settings.pricing));
    
    // Save updated settings if needed
    saveAppData();
}

// Format currency
function formatCurrency(amount) {
    return '£' + amount.toFixed(2);
}

// Helper function to get the suffix for a day number (1st, 2nd, 3rd, etc.)
function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
