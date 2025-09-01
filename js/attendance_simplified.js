// Simplified Attendance module
let currentChildId = null;

function initAttendanceModule() {
    document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);
    document.getElementById('back-to-children-btn').addEventListener('click', showChildrenSection);
    
    // Add event listeners for child selection
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('attendance-btn')) {
            const childId = e.target.getAttribute('data-child-id');
            selectChild(childId);
        }
    });
    
    // Initialize calendar styles
    addCalendarStyles();
    
    // Add CSS for the pattern selector
    addPatternSelectorStyles();
}

// Select a child for attendance management
function selectChild(childId) {
    console.log('Selecting child with ID:', childId);
    
    // Set current child ID
    currentChildId = childId;
    
    // Get child data
    const child = getCurrentMonthChildren().find(c => c.id === childId);
    if (!child) {
        console.error('Child not found with ID:', childId);
        return;
    }
    
    console.log('Child found:', child.name);
    
    // Debug: Log attendance data when loading
    console.log('Child attendance data when loading:', 
        child.calendarAttendance ? 
        JSON.parse(JSON.stringify(child.calendarAttendance)) : 
        'No attendance data');
    
    // Check if attendance data exists for current month
    if (!child.calendarAttendance || !child.calendarAttendance[appData.currentMonth]) {
        console.log('No attendance data for current month:', appData.currentMonth);
    } else {
        console.log('Attendance data exists for current month:', 
            Object.keys(child.calendarAttendance[appData.currentMonth]).length, 'days with data');
    }
    
    // Update attendance title with child name
    document.getElementById('attendance-title').textContent = `Attendance for ${child.name}`;
    
    // Generate simplified calendar view
    generateSimplifiedCalendarView(child);
    
    // Show attendance section
    document.getElementById('attendance-section').classList.remove('d-none');
    document.getElementById('children-section').classList.add('d-none');
}

// Save attendance data
function saveAttendance() {
    // Get the current child
    const child = getCurrentMonthChildren().find(c => c.id === currentChildId);
    
    if (!child) {
        console.error('Cannot save attendance: Child not found with ID', currentChildId);
        alert('Error: Could not find child data to save attendance.');
        return;
    }
    
    // CRITICAL FIX: Ensure the child reference in appData is updated with the attendance data
    // Find the child in the appData structure and update it directly
    const childIndex = appData.months[appData.currentMonth].children.findIndex(c => c.id === currentChildId);
    if (childIndex !== -1) {
        // Make sure calendarAttendance exists
        if (!appData.months[appData.currentMonth].children[childIndex].calendarAttendance) {
            appData.months[appData.currentMonth].children[childIndex].calendarAttendance = {};
        }
        
        // Copy the attendance data from the local child object to the appData structure
        if (child.calendarAttendance) {
            appData.months[appData.currentMonth].children[childIndex].calendarAttendance = 
                JSON.parse(JSON.stringify(child.calendarAttendance));
        }
    } else {
        console.error('Child not found in appData structure');
    }
    
    // Save app data to localStorage
    saveAppData();
    
    // Show success message
    alert('Attendance data saved successfully!');
    
    // Go back to children list
    showChildrenSection();
    
    // Update invoices to reflect attendance data if function exists
    if (typeof updateInvoicesUI === 'function') {
        updateInvoicesUI();
    }
}

// Show the children section
function showChildrenSection() {
    document.getElementById('attendance-section').classList.add('d-none');
    document.getElementById('children-section').classList.remove('d-none');
}

// Generate simplified calendar view for attendance
function generateSimplifiedCalendarView(child) {
    const container = document.getElementById('attendance-table-container');
    container.innerHTML = '';
    
    // Generate calendar view
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';
    container.appendChild(calendarContainer);
    
    // Add quick pattern setter UI
    const patternSetterDiv = document.createElement('div');
    patternSetterDiv.className = 'card mb-3';
    patternSetterDiv.innerHTML = `
        <div class="card-header bg-primary text-white">
            <i class="bi bi-calendar-plus"></i> Quick Attendance Pattern
        </div>
        <div class="card-body" id="pattern-card-body">
            <p class="card-text">Set weekly attendance pattern:</p>
            
            <!-- Week View Table -->
            <div class="table-responsive mb-3">
                <table class="table table-bordered table-sm">
                    <thead class="table-light">
                        <tr>
                            <th>Time Slot</th>
                            <th>Monday</th>
                            <th>Tuesday</th>
                            <th>Wednesday</th>
                            <th>Thursday</th>
                            <th>Friday</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Early</strong><br><small>7:45-9:00</small></td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="1" data-slot="early" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="1" data-slot="early" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="2" data-slot="early" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="2" data-slot="early" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="3" data-slot="early" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="3" data-slot="early" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="4" data-slot="early" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="4" data-slot="early" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="5" data-slot="early" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="5" data-slot="early" data-type="free">V</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Morning</strong><br><small>9:00-11:30</small></td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="1" data-slot="morning" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="1" data-slot="morning" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="2" data-slot="morning" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="2" data-slot="morning" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="3" data-slot="morning" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="3" data-slot="morning" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="4" data-slot="morning" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="4" data-slot="morning" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="5" data-slot="morning" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="5" data-slot="morning" data-type="free">V</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Lunch</strong><br><small>11:30-13:00</small></td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="1" data-slot="lunch" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="1" data-slot="lunch" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="2" data-slot="lunch" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="2" data-slot="lunch" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="3" data-slot="lunch" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="3" data-slot="lunch" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="4" data-slot="lunch" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="4" data-slot="lunch" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="5" data-slot="lunch" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="5" data-slot="lunch" data-type="free">V</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Afternoon</strong><br><small>13:00-15:00</small></td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="1" data-slot="afternoon" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="1" data-slot="afternoon" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="2" data-slot="afternoon" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="2" data-slot="afternoon" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="3" data-slot="afternoon" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="3" data-slot="afternoon" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="4" data-slot="afternoon" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="4" data-slot="afternoon" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="5" data-slot="afternoon" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="5" data-slot="afternoon" data-type="free">V</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Late</strong><br><small>15:00-17:30</small></td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="1" data-slot="late" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="1" data-slot="late" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="2" data-slot="late" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="2" data-slot="late" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="3" data-slot="late" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="3" data-slot="late" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="4" data-slot="late" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="4" data-slot="late" data-type="free">V</button>
                                </div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary pattern-btn" data-day="5" data-slot="late" data-type="paid">P</button>
                                    <button type="button" class="btn btn-outline-success pattern-btn" data-day="5" data-slot="late" data-type="free">V</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="row mb-3">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light">
                            <strong>Apply to:</strong>
                        </div>
                        <div class="card-body">
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="weekSelection" id="week-all" value="all" checked>
                                <label class="form-check-label" for="week-all">All Weeks</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="weekSelection" id="week-specific" value="specific">
                                <label class="form-check-label" for="week-specific">Specific Weeks</label>
                            </div>
                            
                            <div id="specific-weeks-container" class="mt-2" style="display: none;">
                                <div class="row">
                                    <div class="col-md-3 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input week-checkbox" type="checkbox" id="week-1" value="1">
                                            <label class="form-check-label" for="week-1">Week 1</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input week-checkbox" type="checkbox" id="week-2" value="2">
                                            <label class="form-check-label" for="week-2">Week 2</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input week-checkbox" type="checkbox" id="week-3" value="3">
                                            <label class="form-check-label" for="week-3">Week 3</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input week-checkbox" type="checkbox" id="week-4" value="4">
                                            <label class="form-check-label" for="week-4">Week 4</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input week-checkbox" type="checkbox" id="week-5" value="5">
                                            <label class="form-check-label" for="week-5">Week 5</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input week-checkbox" type="checkbox" id="week-6" value="6">
                                            <label class="form-check-label" for="week-6">Week 6 (if applicable)</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="checkbox" id="skip-holidays" checked>
                                <label class="form-check-label" for="skip-holidays">
                                    Skip Bank Holidays (will not overwrite existing attendance)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Apply Pattern button will be added dynamically -->
        </div>
    `;
    container.appendChild(patternSetterDiv);
    
    // Add event listeners for the week selection radios
    document.getElementById('week-all').addEventListener('change', function() {
        document.getElementById('specific-weeks-container').style.display = 'none';
    });
    
    document.getElementById('week-specific').addEventListener('change', function() {
        document.getElementById('specific-weeks-container').style.display = 'block';
    });
    
    // Add event listeners for the pattern buttons
    document.querySelectorAll('.pattern-btn').forEach(button => {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const slot = this.getAttribute('data-slot');
            const type = this.getAttribute('data-type');
            
            console.log(`Pattern button clicked: day=${day}, slot=${slot}, type=${type}`);
            
            // Toggle active state for this button
            this.classList.toggle('active');
            console.log(`Button active state: ${this.classList.contains('active')}`);
            
            // If this button is now active, deactivate its sibling button
            if (this.classList.contains('active')) {
                const siblingType = type === 'paid' ? 'free' : 'paid';
                const siblingSelector = `.pattern-btn[data-day="${day}"][data-slot="${slot}"][data-type="${siblingType}"]`;
                console.log(`Looking for sibling button with selector: ${siblingSelector}`);
                
                const siblingButton = document.querySelector(siblingSelector);
                if (siblingButton) {
                    console.log('Found sibling button, removing active class');
                    siblingButton.classList.remove('active');
                }
            }
        });
    });
    
    // Add event listener for the apply pattern button
    const applyButtonRow = document.createElement('div');
    applyButtonRow.className = 'row mt-3';
    applyButtonRow.innerHTML = `
        <div class="col-12 text-end">
            <button id="apply-pattern-btn" class="btn btn-primary">
                <i class="bi bi-check-circle"></i> Apply Pattern to Month
            </button>
        </div>
    `;
    console.log('Creating Apply Pattern button');
    const patternCardBody = document.getElementById('pattern-card-body');
    console.log('Pattern card body found:', patternCardBody);
    patternCardBody.appendChild(applyButtonRow);
    
    document.getElementById('apply-pattern-btn').addEventListener('click', function() {
        console.log('Apply Pattern button clicked');
        applyAttendancePattern(child);
    });
    
    // Update the attendance legend with simplified version
    updateSimplifiedAttendanceLegend();
    
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
            
            // Check if the day is in the current month
            if (dayNumber < 1 || dayNumber > daysInMonth) {
                cell.className = 'other-month';
                row.appendChild(cell);
                continue;
            }
            
            // Check if the day is today
            if (isCurrentMonth && dayNumber === currentDay) {
                cell.classList.add('today');
            }
            
            // Check if the day is a weekend
            const dayOfWeek = new Date(year, month - 1, dayNumber).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                cell.classList.add('weekend');
                
                // Add day number
                const dayNumberElement = document.createElement('div');
                dayNumberElement.className = 'day-number';
                dayNumberElement.textContent = dayNumber;
                cell.appendChild(dayNumberElement);
                
                row.appendChild(cell);
                continue;
            }
            
            // Add day number
            const dayNumberElement = document.createElement('div');
            dayNumberElement.className = 'day-number';
            dayNumberElement.textContent = dayNumber;
            cell.appendChild(dayNumberElement);
            
            // Create attendance container for the day
            const attendanceContainer = document.createElement('div');
            attendanceContainer.className = 'attendance-container';
            
            // Initialize calendar attendance data if not exists
            if (!child.calendarAttendance) {
                child.calendarAttendance = {};
            }
            if (!child.calendarAttendance[appData.currentMonth]) {
                child.calendarAttendance[appData.currentMonth] = {};
            }
            
            // Get day name for this date (monday, tuesday, etc.)
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[dayOfWeek];
            
            // Determine current attendance status
            const dayAttendance = child.calendarAttendance[appData.currentMonth][dayNumber] || {};
            
            // Create individual badges for each time slot
            const timeSlots = [
                { id: 'early', label: 'E', title: 'Early (7:45-9:00)' },
                { id: 'morning', label: 'M', title: 'Morning (9:00-11:30)' },
                { id: 'lunch', label: 'L', title: 'Lunch (11:30-13:00)' },
                { id: 'afternoon', label: 'A', title: 'Afternoon (13:00-15:00)' },
                { id: 'late', label: 'La', title: 'Late (15:00-17:30)' }
            ];
            
            // Create a row for the time slots
            const slotsRow = document.createElement('div');
            slotsRow.className = 'time-slots-row';
            
            // Add each time slot badge
            timeSlots.forEach(slot => {
                // Create container for each slot
                const slotContainer = document.createElement('div');
                slotContainer.className = 'time-slot-container';
                
                // Add slot label
                const slotLabel = document.createElement('div');
                slotLabel.className = 'slot-label';
                slotLabel.textContent = slot.id.charAt(0).toUpperCase();
                slotLabel.title = slot.title;
                slotContainer.appendChild(slotLabel);
                
                // Create badge
                const badge = document.createElement('div');
                badge.className = 'attendance-badge';
                badge.dataset.slot = slot.id;
                badge.title = slot.title;
                
                // Set badge status based on attendance
                const status = dayAttendance[slot.id] || 'none';
                if (status === 'none') {
                    badge.classList.add('none');
                    badge.textContent = '-';
                } else if (status === 'paid') {
                    badge.classList.add('paid');
                    badge.textContent = 'P';
                } else if (status === 'free') {
                    badge.classList.add('free');
                    badge.textContent = 'F';
                }
                
                // Add click event to toggle attendance for this slot
                badge.addEventListener('click', function() {
                    toggleSlotAttendance(child, dayNumber, slot.id, badge);
                });
                
                slotContainer.appendChild(badge);
                slotsRow.appendChild(slotContainer);
            });
            
            attendanceContainer.appendChild(slotsRow);
            cell.appendChild(attendanceContainer);
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    calendarContainer.appendChild(table);
    
    // Add attendance guide below the calendar
    const legendDiv = document.createElement('div');
    legendDiv.className = 'attendance-legend card mt-4';
    container.appendChild(legendDiv);
    
    // Update the legend
    updateSimplifiedAttendanceLegend();
}

// Toggle attendance for a specific slot in a day
function toggleSlotAttendance(child, day, slot, badgeElement) {
    // Initialize calendar attendance data if not exists
    if (!child.calendarAttendance) {
        child.calendarAttendance = {};
    }
    if (!child.calendarAttendance[appData.currentMonth]) {
        child.calendarAttendance[appData.currentMonth] = {};
    }
    if (!child.calendarAttendance[appData.currentMonth][day]) {
        child.calendarAttendance[appData.currentMonth][day] = {};
    }
    
    // Get current attendance status for this slot
    const currentStatus = child.calendarAttendance[appData.currentMonth][day][slot] || 'none';
    
    // Determine next state based on current state
    let nextState;
    if (currentStatus === 'none') {
        // Currently not attending, set to paid
        nextState = 'paid';
    } else if (currentStatus === 'paid') {
        // Currently paid, set to free (all children are now eligible)
        nextState = 'free';
    } else {
        // Currently free, set to none
        nextState = 'none';
    }
    
    // Apply the next state to this slot
    child.calendarAttendance[appData.currentMonth][day][slot] = nextState;
    
    // Update badge appearance
    updateBadgeAppearance(badgeElement, nextState);
    
    // CRITICAL FIX: Ensure the child reference in appData is updated with the attendance data
    // Find the child in the appData structure and update it directly
    const childIndex = appData.months[appData.currentMonth].children.findIndex(c => c.id === child.id);
    if (childIndex !== -1) {
        // Make sure calendarAttendance exists
        if (!appData.months[appData.currentMonth].children[childIndex].calendarAttendance) {
            appData.months[appData.currentMonth].children[childIndex].calendarAttendance = {};
        }
        
        // Copy the attendance data from the local child object to the appData structure
        if (child.calendarAttendance) {
            appData.months[appData.currentMonth].children[childIndex].calendarAttendance = 
                JSON.parse(JSON.stringify(child.calendarAttendance));
        }
    }
    
    // Save data automatically
    saveAppData();
    
    // Auto-refresh invoice data if function exists
    if (typeof updateInvoicesUI === 'function') {
        updateInvoicesUI();
    }
}

// Toggle attendance for all slots in a day
function toggleAllDayAttendance(child, day, badgeElement) {
    // Initialize calendar attendance data if not exists
    if (!child.calendarAttendance) {
        child.calendarAttendance = {};
    }
    if (!child.calendarAttendance[appData.currentMonth]) {
        child.calendarAttendance[appData.currentMonth] = {};
    }
    if (!child.calendarAttendance[appData.currentMonth][day]) {
        child.calendarAttendance[appData.currentMonth][day] = {};
    }
    
    // Get current attendance status
    const dayAttendance = child.calendarAttendance[appData.currentMonth][day];
    
    // Count paid and free slots
    let paidCount = 0;
    let freeCount = 0;
    
    // Check each slot
    ['early', 'morning', 'lunch', 'afternoon', 'late'].forEach(slot => {
        if (dayAttendance[slot] === 'paid') paidCount++;
        if (dayAttendance[slot] === 'free') freeCount++;
    });
    
    // Determine next state based on current state
    let nextState;
    if (paidCount === 0 && freeCount === 0) {
        // Currently not attending, set to paid
        nextState = 'paid';
    } else if (paidCount > 0 && freeCount === 0) {
        // Currently paid, set to free (all children are now eligible)
        nextState = 'free';
    } else {
        // Currently free or mixed, set to none
        nextState = 'none';
    }
    
    // Apply the next state to all slots
    ['early', 'morning', 'lunch', 'afternoon', 'late'].forEach(slot => {
        dayAttendance[slot] = nextState;
    });
    
    // Update badge appearance
    updateBadgeAppearance(badgeElement, nextState);
    
    // CRITICAL FIX: Ensure the child reference in appData is updated with the attendance data
    // Find the child in the appData structure and update it directly
    const childIndex = appData.months[appData.currentMonth].children.findIndex(c => c.id === child.id);
    if (childIndex !== -1) {
        // Make sure calendarAttendance exists
        if (!appData.months[appData.currentMonth].children[childIndex].calendarAttendance) {
            appData.months[appData.currentMonth].children[childIndex].calendarAttendance = {};
        }
        
        // Copy the attendance data from the local child object to the appData structure
        if (child.calendarAttendance) {
            appData.months[appData.currentMonth].children[childIndex].calendarAttendance = 
                JSON.parse(JSON.stringify(child.calendarAttendance));
        }
    }
    
    // Save data automatically
    saveAppData();
    
    // Auto-refresh invoice data if function exists
    if (typeof updateInvoicesUI === 'function') {
        updateInvoicesUI();
    }
}

// Update badge appearance based on attendance state
function updateBadgeAppearance(badgeElement, state) {
    // Remove all state classes
    badgeElement.classList.remove('none', 'paid', 'free');
    
    // Add appropriate class and text
    if (state === 'none') {
        badgeElement.classList.add('none');
        badgeElement.textContent = '-';
        badgeElement.title = 'Not attending';
    } else if (state === 'paid') {
        badgeElement.classList.add('paid');
        badgeElement.textContent = 'P';
        badgeElement.title = 'Paid attendance';
    } else if (state === 'free') {
        badgeElement.classList.add('free');
        badgeElement.textContent = 'V';
        badgeElement.title = 'Free (Early Years Entitlement)';
    }
}

// Check if the child has free hours available
function hasFreeHoursAvailable(child) {
    // All children are now eligible for free hours as per new law
    // No age group restriction
    
    // Calculate used free hours
    let usedFreeHours = 0;
    
    // Get the month and year from the current month key (format: YYYY-MM)
    const [year, month] = appData.currentMonth.split('-').map(Number);
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // For each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
        // Skip weekends
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Get attendance data for this day
        const dayAttendance = child.calendarAttendance && 
                             child.calendarAttendance[appData.currentMonth] && 
                             child.calendarAttendance[appData.currentMonth][day] || {};
        
        // For each time slot
        ['early', 'morning', 'lunch', 'afternoon', 'late'].forEach(slot => {
            if (dayAttendance[slot] === 'free') {
                usedFreeHours += getSlotDuration(slot);
            }
        });
    }
    
    // Check if there are free hours available
    return usedFreeHours < child.freeHours;
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

// Update the attendance legend in the attendance section
function updateSimplifiedAttendanceLegend() {
    const legendContainer = document.getElementById('attendance-legend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = `
        <div class="legend-item">
            <span class="attendance-badge none">-</span>
            <span>Not Attending</span>
        </div>
        <div class="legend-item">
            <span class="attendance-badge paid">P</span>
            <span>Paid Session</span>
        </div>
        <div class="legend-item">
            <span class="attendance-badge free">V</span>
            <span>Voucher (Gov. Funded)</span>
        </div>
    `;
}

// Add CSS styles for the calendar
function addCalendarStyles() {
    if (document.getElementById('attendance-simplified-styles')) return;
    const link = document.createElement('link');
    link.id = 'attendance-simplified-styles';
    link.rel = 'stylesheet';
    link.href = 'css/attendance-simplified.css';
    document.head.appendChild(link);
}

// Add CSS styles for the pattern selector
function addPatternSelectorStyles() {
    if (document.getElementById('pattern-selector-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pattern-selector-styles';
    style.textContent = `
        .time-pattern-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .attendance-type-selector {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        @media (max-width: 768px) {
            .time-pattern-selector,
            .attendance-type-selector {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    `;
    document.head.appendChild(style);
}

// Helper function to get children for the current month
function getCurrentMonthChildren() {
    if (!appData.months[appData.currentMonth]) {
        return [];
    }
    
    return appData.months[appData.currentMonth].children || [];
}

// Function to get the week number (1-6) for a given day
function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeekOfFirst = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days since first day of month (0-indexed)
    const daysSinceFirst = date.getDate() - 1;
    
    // Calculate the week number (1-indexed)
    return Math.ceil((daysSinceFirst + dayOfWeekOfFirst) / 7);
}

// Apply attendance pattern to selected weekdays in the month
function applyAttendancePattern(child) {
    try {
        console.log('Applying attendance pattern for child:', child.name);
        console.log('Current month:', appData.currentMonth);
        
        // Get selected pattern from the week view table
        const patternData = {};
        const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
        const timeSlots = ['early', 'morning', 'lunch', 'afternoon', 'late'];
        
        // Initialize pattern data structure
        weekdays.forEach(day => {
            patternData[day] = {};
        });
        
        // Collect active buttons from the pattern UI
        console.log('Looking for active pattern buttons...');
        const activeButtons = document.querySelectorAll('.pattern-btn.active');
        console.log('Found active buttons:', activeButtons.length);
        
        activeButtons.forEach(button => {
            const day = parseInt(button.getAttribute('data-day'));
            const slot = button.getAttribute('data-slot');
            const type = button.getAttribute('data-type');
            
            console.log(`Active button: day=${day}, slot=${slot}, type=${type}`);
            
            // Store in pattern data
            patternData[day][slot] = type;
        });
        
        console.log('Pattern data collected:', patternData);
        
        // Check if any pattern is selected
        let hasPattern = false;
        weekdays.forEach(day => {
            if (Object.keys(patternData[day]).length > 0) {
                hasPattern = true;
            }
        });
        
        if (!hasPattern) {
            alert('Please select at least one attendance pattern.');
            return;
        }
        
        // Get week selection mode
        const weekSelectionMode = document.querySelector('input[name="weekSelection"]:checked').value;
        console.log('Week selection mode:', weekSelectionMode);
        
        // Get selected weeks if specific weeks mode
        const selectedWeeks = [];
        if (weekSelectionMode === 'specific') {
            const checkedWeeks = document.querySelectorAll('.week-checkbox:checked');
            console.log('Found checked week checkboxes:', checkedWeeks.length);
            
            checkedWeeks.forEach(checkbox => {
                const weekValue = parseInt(checkbox.value);
                console.log('Adding selected week:', weekValue);
                selectedWeeks.push(weekValue);
            });
            
            // If no weeks selected, show error
            if (selectedWeeks.length === 0) {
                console.log('No weeks selected, showing error');
                alert('Please select at least one week.');
                return;
            }
            
            console.log('Selected weeks:', selectedWeeks);
        }
        
        // Get skip holidays option
        const skipHolidays = document.getElementById('skip-holidays') ? 
            document.getElementById('skip-holidays').checked : false;
        console.log('Skip holidays option:', skipHolidays);
        
        // Get the month and year from the current month key (format: YYYY-MM)
        const [year, month] = appData.currentMonth.split('-').map(Number);
        console.log(`Year: ${year}, Month: ${month}`);
        
        // Get the number of days in the month
        const daysInMonth = new Date(year, month, 0).getDate();
        console.log('Days in month:', daysInMonth);
        
        // Initialize calendar attendance data if not exists
        if (!child.calendarAttendance) {
            console.log('Initializing calendarAttendance object for child');
            child.calendarAttendance = {};
        }
        if (!child.calendarAttendance[appData.currentMonth]) {
            console.log(`Initializing attendance data for month: ${appData.currentMonth}`);
            child.calendarAttendance[appData.currentMonth] = {};
        }
        
        console.log('Current attendance data:', child.calendarAttendance[appData.currentMonth]);
        
        // Apply pattern to each day in the month
        console.log('Starting to apply pattern to each day in the month');
        let daysProcessed = 0;
        let daysPatternApplied = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            daysProcessed++;
            
            // Convert JavaScript day (0=Sunday, 1=Monday) to our day format (1=Monday, 5=Friday)
            const weekdayIndex = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
            
            // Skip weekends (6 = Saturday, 7 = Sunday in our adjusted format)
            if (weekdayIndex > 5) {
                console.log(`Day ${day} is a weekend (weekdayIndex: ${weekdayIndex}), skipping`);
                continue;
            }
            
            // If using specific weeks mode, check if this day is in a selected week
            if (weekSelectionMode === 'specific') {
                const weekOfMonth = getWeekOfMonth(date);
                console.log(`Day ${day} is in week ${weekOfMonth} of the month`);
                
                if (!selectedWeeks.includes(weekOfMonth)) {
                    console.log(`Day ${day} is not in selected weeks ${selectedWeeks.join(', ')}, skipping`);
                    continue;
                } else {
                    console.log(`Day ${day} is in selected week ${weekOfMonth}, processing`);
                }
            }
            
            // Skip bank holidays if option is selected
            if (skipHolidays) {
                // Check if this day already has attendance data (might be a holiday)
                const existingAttendance = child.calendarAttendance[appData.currentMonth][day] || {};
                let hasExistingAttendance = false;
                
                // Check if any slot has attendance marked
                ['early', 'morning', 'lunch', 'afternoon', 'late'].forEach(slot => {
                    if (existingAttendance[slot] && existingAttendance[slot] !== 'none') {
                        console.log(`Day ${day} slot ${slot} already has attendance: ${existingAttendance[slot]}`);
                        hasExistingAttendance = true;
                    }
                });
                
                // If this day has existing attendance and we're skipping holidays, continue to next day
                if (hasExistingAttendance) {
                    console.log(`Day ${day} has existing attendance, skipping as potential holiday`);
                    continue;
                }
            }
            
            // Initialize day attendance if not exists
            if (!child.calendarAttendance[appData.currentMonth][day]) {
                console.log(`Initializing attendance data for day ${day}`);
                child.calendarAttendance[appData.currentMonth][day] = {};
            }
            
            // Apply pattern for this weekday to the current day
            const dayPattern = patternData[weekdayIndex];
            console.log(`Applying pattern for day ${day} (weekday ${weekdayIndex}):`, dayPattern);
            
            for (const slot in dayPattern) {
                console.log(`Setting ${slot} to ${dayPattern[slot]} for day ${day}`);
                child.calendarAttendance[appData.currentMonth][day][slot] = dayPattern[slot];
                daysPatternApplied++;
            }
        }
        
        console.log(`Pattern application complete. Processed ${daysProcessed} days, applied pattern to ${daysPatternApplied} slots.`);
        console.log('Updated attendance data:', child.calendarAttendance[appData.currentMonth]);
        
        // Update the calendar view
        console.log('Regenerating calendar view with updated attendance data');
        generateSimplifiedCalendarView(child);
        
        // Save the updated attendance data to localStorage
        localStorage.setItem('appData', JSON.stringify(appData));
        console.log('Attendance data saved to localStorage');
        
        // Show success message
        const weekMessage = weekSelectionMode === 'all' ? 'all weekdays' : 'selected weeks';
        alert(`Attendance pattern applied to ${weekMessage} for ${child.name}.`);
        
    } catch (error) {
        console.error('Error applying attendance pattern:', error);
        alert('An error occurred while applying the attendance pattern.');
    }
}

// Update attendance legend in the UI with simplified version
function updateSimplifiedAttendanceLegend() {
    const legendContainer = document.querySelector('.attendance-legend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = `
        <div class="card-header bg-primary text-white">
            <i class="bi bi-info-circle"></i> Attendance Guide
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="bi bi-calendar-check"></i> Attendance Status:</h6>
                    <div class="status-item"><span class="badge rounded-pill bg-primary">P</span> Paid Session</div>
                    <div class="status-item"><span class="badge rounded-pill bg-success">V</span> Voucher (Government Funded - All Ages)</div>
                    <div class="status-item"><span class="badge rounded-pill bg-light text-dark">-</span> Not Attending</div>
                </div>
                <div class="col-md-6">
                    <h6><i class="bi bi-hand-index-thumb"></i> How to Use:</h6>
                    <div class="instruction-item">Click on a badge to toggle between:</div>
                    <div class="instruction-item">Not Attending → Paid/Free → Not Attending</div>
                    <div class="instruction-item">Use the Quick Attendance Pattern at the top to set the same pattern for all weekdays</div>
                    <div class="instruction-item mt-2">Click <button class="btn btn-sm btn-primary"><i class="bi bi-save"></i> Save</button> when done</div>
                </div>
            </div>
        </div>
    `;
}
