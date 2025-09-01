// Attendance module
let currentChildId = null;

function initAttendanceModule() {
    document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);
    
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

// Select a child for attendance management
function selectChild(childId) {
    // Set current child ID
    currentChildId = childId;
    
    // Get child data
    const child = getCurrentMonthChildren().find(c => c.id === childId);
    if (!child) return;
    
    // Update child name in attendance section
    document.getElementById('attendance-child-name').textContent = child.name;
    
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
            
            // Check if the day is within the current month
            if (dayNumber > 0 && dayNumber <= daysInMonth) {
                // Add day number
                const dayHeader = document.createElement('div');
                dayHeader.className = 'day-header';
                dayHeader.textContent = dayNumber;
                cell.appendChild(dayHeader);
                
                // Highlight today
                if (isCurrentMonth && dayNumber === currentDay) {
                    cell.classList.add('today');
                }
                
                // Weekend styling
                if (j === 5 || j === 6) {
                    cell.classList.add('weekend');
                } else {
                    // Add attendance slots for weekdays
                    const slotsContainer = document.createElement('div');
                    slotsContainer.className = 'attendance-slots';
                    
                    // Get attendance data for this day
                    const dayAttendance = getAttendanceForDay(child, dayNumber);
                    
                    // Add slots
                    ['early', 'morning', 'lunch', 'afternoon', 'late'].forEach(slot => {
                        const slotContainer = document.createElement('div');
                        slotContainer.className = 'attendance-slot';
                        
                        // Add slot label for small screens
                        const slotLabel = document.createElement('span');
                        slotLabel.className = 'slot-label';
                        switch(slot) {
                            case 'early': slotLabel.textContent = 'E'; break;
                            case 'morning': slotLabel.textContent = 'M'; break;
                            case 'lunch': slotLabel.textContent = 'L'; break;
                            case 'afternoon': slotLabel.textContent = 'A'; break;
                            case 'late': slotLabel.textContent = 'P'; break;
                        }
                        slotContainer.appendChild(slotLabel);
                        
                        // Create tooltip container
                        const tooltipDiv = document.createElement('div');
                        tooltipDiv.className = 'attendance-tooltip';
                        
                        // Add badge
                        const slotBadge = document.createElement('span');
                        slotBadge.className = 'badge rounded-pill';
                        
                        // Set badge text and class based on attendance type
                        const attendanceType = dayAttendance[slot] || null;
                        if (attendanceType === 'paid') {
                            slotBadge.textContent = 'P';
                            slotBadge.classList.add('bg-primary');
                        } else if (attendanceType === 'free') {
                            slotBadge.textContent = 'V'; // Changed from 'F' to 'V'
                            slotBadge.classList.add('bg-success');
                        } else {
                            slotBadge.textContent = '-';
                            slotBadge.classList.add('bg-light', 'text-dark');
                        }
                        
                        // Create tooltip text
                        const tooltipText = document.createElement('span');
                        tooltipText.className = 'tooltip-text';
                        
                        // Set tooltip text based on attendance type and slot
                        const slotLabels = {
                            'early': 'Early Morning (7:30-9:00)',
                            'morning': 'Morning (9:00-12:00)',
                            'lunch': 'Lunch (12:00-13:00)',
                            'afternoon': 'Afternoon (13:00-15:30)',
                            'late': 'Late Afternoon (15:30-18:00)'
                        };
                        
                        if (attendanceType === 'paid') {
                            tooltipText.textContent = 'Paid: ' + slotLabels[slot];
                        } else if (attendanceType === 'free') {
                            tooltipText.textContent = 'Free (Early Years Entitlement): ' + slotLabels[slot]; // Updated tooltip text
                        } else {
                            tooltipText.textContent = 'Not Attending: ' + slotLabels[slot];
                        }
                        
                        tooltipDiv.appendChild(slotBadge);
                        tooltipDiv.appendChild(tooltipText);
                        slotContainer.appendChild(tooltipDiv);
                        
                        // Add click event for toggling attendance
                        slotBadge.addEventListener('click', function() {
                            toggleCalendarAttendance(child, dayNumber, slot, this);
                        });
                        
                        slotsContainer.appendChild(slotContainer);
                    });
                    
                    cell.appendChild(slotsContainer);
                }
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
}

// Toggle attendance status for a calendar slot
function toggleCalendarAttendance(child, day, slot, badgeElement) {
    // Initialize calendar attendance data structure if needed
    if (!child.calendarAttendance) {
        child.calendarAttendance = {};
    }
    
    if (!child.calendarAttendance[appData.currentMonth]) {
        child.calendarAttendance[appData.currentMonth] = {};
    }
    
    if (!child.calendarAttendance[appData.currentMonth][day]) {
        child.calendarAttendance[appData.currentMonth][day] = {};
    }
    
    // Slot labels for tooltips
    const slotLabels = {
        'early': 'Early Morning (7:30-9:00)',
        'morning': 'Morning (9:00-12:00)',
        'lunch': 'Lunch (12:00-13:00)',
        'afternoon': 'Afternoon (13:00-15:30)',
        'late': 'Late Afternoon (15:30-18:00)'
    };
    
    // Get current status
    const currentStatus = child.calendarAttendance[appData.currentMonth][day][slot] || 'none';
    
    // Find the tooltip element (it's a sibling of the badge within the tooltip div)
    const tooltipDiv = badgeElement.closest('.attendance-tooltip');
    const tooltipText = tooltipDiv ? tooltipDiv.querySelector('.tooltip-text') : null;
    
    // Toggle status with animation
    let newStatus;
    
    // Add a temporary animation class
    badgeElement.classList.add('badge-updating');
    
    // Toggle the status after a brief delay for animation
    setTimeout(() => {
        if (currentStatus === 'none') {
            // If child is eligible for free hours, set as free first
            if (child.ageGroup === '3-4' && hasFreeHoursAvailable(child)) {
                newStatus = 'free';
                badgeElement.className = 'badge rounded-pill bg-success';
                badgeElement.textContent = 'V'; // Changed from 'F' to 'V'
                if (tooltipText) tooltipText.textContent = 'Free (Early Years Entitlement): ' + slotLabels[slot];
            } else {
                newStatus = 'paid';
                badgeElement.className = 'badge rounded-pill bg-primary';
                badgeElement.textContent = 'P';
                if (tooltipText) tooltipText.textContent = 'Paid: ' + slotLabels[slot];
            }
        } else if (currentStatus === 'paid') {
            // If child is eligible for free hours, toggle to free
            if (child.ageGroup === '3-4' && hasFreeHoursAvailable(child)) {
                newStatus = 'free';
                badgeElement.className = 'badge rounded-pill bg-success';
                badgeElement.textContent = 'V'; // Changed from 'F' to 'V'
                if (tooltipText) tooltipText.textContent = 'Free (Early Years Entitlement): ' + slotLabels[slot];
            } else {
                newStatus = 'none';
                badgeElement.className = 'badge rounded-pill bg-light text-dark';
                badgeElement.textContent = '-';
                if (tooltipText) tooltipText.textContent = 'Not Attending: ' + slotLabels[slot];
            }
        } else if (currentStatus === 'free') {
            newStatus = 'none';
            badgeElement.className = 'badge rounded-pill bg-light text-dark';
            badgeElement.textContent = '-';
            if (tooltipText) tooltipText.textContent = 'Not Attending: ' + slotLabels[slot];
        }
        
        // Update data
        child.calendarAttendance[appData.currentMonth][day][slot] = newStatus === 'none' ? null : newStatus;
        
        // Save data
        saveAppData();
        
        // Remove the animation class
        badgeElement.classList.remove('badge-updating');
    }, 50);
}

// Check if the child has free hours available
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
            return 1.5; // 7:30-9:00
        case 'morning':
            return 3.0; // 9:00-12:00
        case 'lunch':
            return 1.0; // 12:00-13:00
        case 'afternoon':
            return 2.5; // 13:00-15:30
        case 'late':
            return 2.5; // 15:30-18:00
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
                            <li><span class="badge rounded-pill bg-secondary">E</span> Early Morning: 7:30-9:00</li>
                            <li><span class="badge rounded-pill bg-secondary">M</span> Morning: 9:00-12:00</li>
                            <li><span class="badge rounded-pill bg-secondary">L</span> Lunch: 12:00-13:00</li>
                            <li><span class="badge rounded-pill bg-secondary">A</span> Afternoon: 13:00-15:30</li>
                            <li><span class="badge rounded-pill bg-secondary">P</span> Late Afternoon: 15:30-18:00</li>
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
