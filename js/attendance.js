// Attendance module
let currentChildId = null;

function initAttendanceModule() {
    // Add event listener for save button
    document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);
    
    // Add event listener for back button
    document.getElementById('back-to-children-btn').addEventListener('click', function() {
        document.getElementById('attendance-section').classList.add('d-none');
        document.getElementById('children-section').classList.remove('d-none');
    });
    
    // Add event listeners for child selection
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('select-attendance-btn')) {
            const childId = e.target.getAttribute('data-child-id');
            selectChild(childId);
        }
    });
    
    // Initialize calendar styles
    addCalendarStyles();
}

// Helper function to get attendance data for a specific day
function getAttendanceForDay(child, dayStr) {
    console.log('Getting attendance for child:', child.name, 'day:', dayStr);
    
    // Get the current month key (format: YYYY-MM)
    const monthKey = appData.currentMonth;
    
    // Initialize attendance data if it doesn't exist
    if (!appData.attendance) {
        appData.attendance = {};
    }
    
    if (!appData.attendance[monthKey]) {
        appData.attendance[monthKey] = {};
    }
    
    if (!appData.attendance[monthKey][child.id]) {
        appData.attendance[monthKey][child.id] = {};
    }
    
    if (!appData.attendance[monthKey][child.id][dayStr]) {
        appData.attendance[monthKey][child.id][dayStr] = {
            early: 'none',
            morning: 'none',
            lunch: 'none',
            afternoon: 'none',
            late: 'none'
        };
    }
    
    return appData.attendance[monthKey][child.id][dayStr];
}

// Select a child for attendance management
function selectChild(childId) {
    console.log('Selecting child for attendance:', childId);
    
    // Set current child ID
    currentChildId = childId;
    
    // Get child data
    const child = getCurrentMonthChildren().find(c => c.id === childId);
    if (!child) {
        console.error('Child not found with ID:', childId);
        return;
    }
    
    console.log('Found child:', child.name);
    
    // Update child name in attendance section
    const attendanceTitleElement = document.getElementById('attendance-title');
    if (attendanceTitleElement) {
        attendanceTitleElement.textContent = 'Attendance for ' + child.name;
    } else {
        console.error('Attendance title element not found');
    }
    
    // Generate calendar view
    generateCalendarView(child);
    
    // Show attendance section
    document.getElementById('attendance-section').classList.remove('d-none');
    document.getElementById('children-section').classList.add('d-none');
}

// Save attendance data
function saveAttendance() {
    // Save app data to localStorage
    saveAppData();
    
    // Show success message
    alert('Attendance data saved successfully!');
    
    // Go back to children list
    document.getElementById('attendance-section').classList.add('d-none');
    document.getElementById('children-section').classList.remove('d-none');
    
    // Update invoices to reflect attendance data
    updateInvoicesUI();
}

// Generate calendar view for attendance
function generateCalendarView(child) {
    const container = document.getElementById('attendance-table-container');
    container.innerHTML = '';
    
    // Get the month and year from the current month key (format: YYYY-MM)
    const [year, month] = appData.currentMonth.split('-').map(Number);
    
    // Create a date object for the first day of the month
    const firstDay = new Date(year, month - 1, 1);
    
    // Get the number of days in the month
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Create calendar table
    const table = document.createElement('table');
    table.className = 'table table-bordered calendar-table';
    
    // Create header row with day names
    const headerRow = document.createElement('tr');
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(dayName => {
        const th = document.createElement('th');
        th.textContent = dayName;
        if (dayName === 'Sat' || dayName === 'Sun') {
            th.className = 'weekend';
        }
        headerRow.appendChild(th);
    });
    
    // Create table header
    const thead = document.createElement('thead');
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Create calendar rows
    let date = 1;
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    
    // Get current date for highlighting today
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const isCurrentMonth = (currentYear === year && currentMonth === month);
    
    for (let i = 0; i < totalCells; i += 7) {
        const row = document.createElement('tr');
        
        // Create cells for each day of the week
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            // Calculate the day number
            const dayNumber = i + j + 1 - firstDayOfWeek;
            
            if (dayNumber > 0 && dayNumber <= daysInMonth) {
                // Add day number
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day-number';
                dayDiv.textContent = dayNumber;
                cell.appendChild(dayDiv);
                
                // Highlight today
                if (isCurrentMonth && dayNumber === currentDay) {
                    cell.classList.add('today');
                }
                
                // Highlight weekends
                if (j === 5 || j === 6) { // Saturday or Sunday
                    cell.classList.add('weekend');
                }
                
                // Get attendance data for this day
                // Format day with leading zero
                const dayStr = dayNumber.toString().padStart(2, '0');
                let dayAttendance = getAttendanceForDay(child, dayStr);
                
                // Create simplified badge container
                const badgeContainer = document.createElement('div');
                badgeContainer.className = 'attendance-badges';
                
                // Add simplified slots with just the badges
                const slots = ['early', 'morning', 'lunch', 'afternoon', 'late'];
                const slotLabels = { early: 'E', morning: 'M', lunch: 'L', afternoon: 'A', late: 'P' };
                
                slots.forEach(slot => {
                    // Create badge
                    const badge = document.createElement('span');
                    badge.className = 'badge rounded-pill';
                    badge.textContent = slotLabels[slot];
                    badge.setAttribute('data-day', dayStr);
                    badge.setAttribute('data-slot', slot);
                    
                    // Set badge class based on attendance status
                    const attendance = dayAttendance[slot];
                    if (attendance === 'paid') {
                        badge.classList.add('bg-primary');
                        badge.title = `Paid: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
                    } else if (attendance === 'free') {
                        badge.classList.add('bg-success');
                        badge.title = `Free: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
                    } else {
                        badge.classList.add('bg-light', 'text-dark');
                        badge.title = `Not Attending: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
                    }
                    
                    // Add click event for toggling attendance
                    badge.addEventListener('click', function() {
                        toggleAttendance(child, dayStr, slot, this);
                    });
                    
                    badgeContainer.appendChild(badge);
                });
                
                cell.appendChild(badgeContainer);
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
}

// Toggle attendance status for a calendar slot
function toggleAttendance(child, dayStr, slot, badgeElement) {
    console.log('Toggling attendance for', child.name, 'day:', dayStr, 'slot:', slot);
    
    // Get the current month key
    const monthKey = appData.currentMonth;
    
    // Initialize attendance data structure if needed
    if (!appData.attendance) {
        appData.attendance = {};
    }
    
    if (!appData.attendance[monthKey]) {
        appData.attendance[monthKey] = {};
    }
    
    if (!appData.attendance[monthKey][child.id]) {
        appData.attendance[monthKey][child.id] = {};
    }
    
    if (!appData.attendance[monthKey][child.id][dayStr]) {
        appData.attendance[monthKey][child.id][dayStr] = {};
    }
    
    // Get current status
    const currentStatus = appData.attendance[monthKey][child.id][dayStr][slot] || 'none';
    
    console.log('Current status:', currentStatus);
    
    // Toggle status
    let newStatus;
    
    if (currentStatus === 'none') {
        // First click: set to paid
        newStatus = 'paid';
        badgeElement.classList.remove('bg-light', 'text-dark');
        badgeElement.classList.add('bg-primary');
        badgeElement.title = `Paid: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
    } else if (currentStatus === 'paid') {
        // Second click: if child is eligible for free hours, set to free
        if (child.freeHours > 0) {
            newStatus = 'free';
            badgeElement.classList.remove('bg-primary');
            badgeElement.classList.add('bg-success');
            badgeElement.title = `Free: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
        } else {
            // If not eligible for free hours, set to none
            newStatus = 'none';
            badgeElement.classList.remove('bg-primary');
            badgeElement.classList.add('bg-light', 'text-dark');
            badgeElement.title = `Not Attending: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
        }
    } else if (currentStatus === 'free') {
        // Third click: set to none
        newStatus = 'none';
        badgeElement.classList.remove('bg-success');
        badgeElement.classList.add('bg-light', 'text-dark');
        badgeElement.title = `Not Attending: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
    }
    
    console.log('New status:', newStatus);
    
    // Update attendance data
    appData.attendance[monthKey][child.id][dayStr][slot] = newStatus;
    
    // Save the updated data
    saveAppData();
}

// Helper function to check if a child has free hours available
function hasFreeHoursAvailable(child) {
    // Only 3-4 year olds are eligible for free hours
    if (child.ageGroup !== '3-4') return false;
    
    // Get the total free hours already used
    let freeHoursUsed = 0;
    
    // Check if the child has calendar attendance data
    if (child.calendarAttendance && child.calendarAttendance[appData.currentMonth]) {
        // For each day in the month
        Object.keys(child.calendarAttendance[appData.currentMonth]).forEach(day => {
            // Get attendance data for this day
            const dayAttendance = child.calendarAttendance[appData.currentMonth][day];
            
            // For each time slot
            Object.keys(dayAttendance).forEach(slot => {
                // If the slot is marked as free
                if (dayAttendance[slot] === 'free') {
                    // Add the slot duration to the total free hours used
                    freeHoursUsed += getSlotDuration(slot);
                }
            });
        });
    }
    
    // Check if the child has used all their free hours (15 hours per week, ~60 hours per month)
    return freeHoursUsed < 60;
}

// Helper function to get attendance data for a specific day
function getAttendanceForDay(child, day) {
    // Check if the child has calendar attendance data
    if (!child.calendarAttendance || !child.calendarAttendance[appData.currentMonth]) {
        return {};
    }
    
    // Check if the child has attendance data for this day
    if (!child.calendarAttendance[appData.currentMonth][day]) {
        return {};
    }
    
    return child.calendarAttendance[appData.currentMonth][day];
}

// Helper function to migrate old attendance data format for a specific day
function migrateOldAttendanceForDay(child, day) {
    // Check if the child has old attendance data
    if (!child.attendance || !child.attendance[appData.currentMonth]) {
        return {};
    }
    
    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const [year, month] = appData.currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return {};
    }
    
    // Map day of week to day name
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    // Check if the child has attendance data for this day
    if (!child.attendance[appData.currentMonth][dayName]) {
        return {};
    }
    
    // Map old attendance data to new format
    const oldAttendance = child.attendance[appData.currentMonth][dayName];
    const newAttendance = {};
    
    if (oldAttendance.early) newAttendance.early = oldAttendance.early === 'free' ? 'free' : 'paid';
    if (oldAttendance.morning) newAttendance.morning = oldAttendance.morning === 'free' ? 'free' : 'paid';
    if (oldAttendance.lunch) newAttendance.lunch = oldAttendance.lunch === 'free' ? 'free' : 'paid';
    if (oldAttendance.afternoon) newAttendance.afternoon = oldAttendance.afternoon === 'free' ? 'free' : 'paid';
    if (oldAttendance.late) newAttendance.late = oldAttendance.late === 'free' ? 'free' : 'paid';
    
    return newAttendance;
}

// Add CSS styles for the calendar
function addCalendarStyles() {
    if (document.getElementById('attendance-styles')) return;
    const link = document.createElement('link');
    link.id = 'attendance-styles';
    link.rel = 'stylesheet';
    link.href = 'css/attendance.css';
    document.head.appendChild(link);
}

// Helper function to get children for the current month
function getCurrentMonthChildren() {
    if (!appData.months[appData.currentMonth]) {
        return [];
    }
    
    return appData.months[appData.currentMonth].children || [];
}

// Get the duration of a time slot in hours
function getSlotDuration(slot) {
    switch (slot) {
        case 'early':
            return 1.25; // 7:45-9:00
        case 'morning':
            return 2.5; // 9:00-11:30
        case 'lunch':
            return 1.5; // 11:30-13:00
        case 'afternoon':
            return 2.0; // 13:00-15:00
        case 'late':
            return 2.5; // 15:00-17:30
        default:
            return 0;
    }
}

// Update attendance legend in the UI
function updateAttendanceLegend() {
    const legendContainer = document.getElementById('attendance-legend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = `
        <div class="card mb-3">
            <div class="card-header">
                <h5><i class="bi bi-info-circle"></i> Attendance Guide</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <h6><i class="bi bi-clock"></i> Time Slots:</h6>
                        <ul class="list-unstyled">
                            <li><span class="badge rounded-pill bg-secondary">E</span> Early Morning: 7:45-9:00</li>
                            <li><span class="badge rounded-pill bg-secondary">M</span> Morning: 9:00-11:30</li>
                            <li><span class="badge rounded-pill bg-secondary">L</span> Lunch: 11:30-13:00</li>
                            <li><span class="badge rounded-pill bg-secondary">A</span> Afternoon: 13:00-15:00</li>
                            <li><span class="badge rounded-pill bg-secondary">P</span> Late Afternoon: 15:00-17:30</li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <h6><i class="bi bi-calendar-check"></i> Attendance Status:</h6>
                        <ul class="list-unstyled">
                            <li><span class="badge rounded-pill bg-primary">P</span> Paid Session</li>
                            <li><span class="badge rounded-pill bg-success">V</span> Free (Early Years Entitlement)</li>
                            <li><span class="badge rounded-pill bg-light text-dark">-</span> Not Attending</li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <h6><i class="bi bi-hand-index-thumb"></i> How to Use:</h6>
                        <p class="small">Click on a badge to toggle between attendance states. For 3-4 year olds, free hours will be used first.</p>
                        <p class="small">Hover over badges to see detailed information.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
