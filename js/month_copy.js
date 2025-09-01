// Month copy functionality
function initMonthCopyModule() {
    // Set up event listener for copy month button
    document.getElementById('copy-month-btn').addEventListener('click', function() {
        showCopyMonthModal();
    });
    
    // Set up event listener for confirm copy button
    document.getElementById('confirm-copy-btn').addEventListener('click', function() {
        copyFromMonth();
    });
}

// Show the copy month modal
function showCopyMonthModal() {
    // Update the current month display
    document.getElementById('copy-current-month-display').textContent = formatMonthKey(appData.currentMonth);
    
    // Populate the source month dropdown
    populateSourceMonthDropdown();
    
    // Show the modal
    const modalElement = document.getElementById('copy-month-modal');
    
    // Remove any existing modal instance to prevent issues
    if (bootstrap.Modal.getInstance(modalElement)) {
        bootstrap.Modal.getInstance(modalElement).dispose();
    }
    
    // Create a new modal instance
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true
    });
    
    modal.show();
}

// Populate the source month dropdown
function populateSourceMonthDropdown() {
    const sourceMonthSelect = document.getElementById('source-month');
    sourceMonthSelect.innerHTML = '';
    
    console.log('Populating source month dropdown', appData);
    
    // Get all months from appData except the current month
    // Make sure appData.months exists
    if (!appData.months) {
        appData.months = {};
        appData.months[appData.currentMonth] = { children: [] };
        console.log('Initialized months object', appData.months);
    }
    
    const months = Object.keys(appData.months).filter(month => month !== appData.currentMonth);
    console.log('Available months for copy:', months);
    
    // Sort months chronologically (newest first)
    months.sort().reverse();
    
    // Check if we have any months at all in appData
    if (!appData.months || Object.keys(appData.months).length <= 1) {
        console.log('No previous months available, creating a dummy month for testing');
        
        // Create the previous month (July 2025) for the current month (which is likely 2025-08)
        // Hard-code July 2025 as requested
        const prevMonthKey = '2025-07';
        let prevMonth = 7;
        let prevYear = 2025;
        
        if (!appData.months) {
            appData.months = {};
        }
        
        if (!appData.months[prevMonthKey]) {
            appData.months[prevMonthKey] = {
                children: [{
                    id: 'dummy-child-' + Date.now(),
                    name: 'Test Child',
                    ageGroup: 'under-3',
                    calendarAttendance: {}
                }]
            };
            
            // Save the updated appData
            saveAppData();
            console.log('Created dummy month:', prevMonthKey);
            
            // Add the dummy month to our months array
            months.push(prevMonthKey);
            months.sort().reverse();
        }
    }
    
    console.log('Adding month options to dropdown, months available:', months);
    
    if (months.length === 0) {
        // No other months available
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No previous months available';
        option.disabled = true;
        sourceMonthSelect.appendChild(option);
        
        // Disable the confirm button
        document.getElementById('confirm-copy-btn').disabled = true;
        console.log('No months available for copying');
    } else {
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = formatMonthKey(month);
            sourceMonthSelect.appendChild(option);
            console.log('Added month option:', month, formatMonthKey(month));
        });
        
        // Enable the confirm button
        document.getElementById('confirm-copy-btn').disabled = false;
        console.log('Enabled confirm copy button');
    }
}

// Copy children and attendance from source month to current month
function copyFromMonth() {
    try {
        // Get the source month
        const sourceMonthKey = document.getElementById('source-month').value;
        
        // Check if source month exists
        if (!appData.months[sourceMonthKey]) {
            throw new Error('Source month not found');
        }
        
        // Get the source month children
        const sourceChildren = appData.months[sourceMonthKey].children || [];
        
        // Check if there are children to copy
        if (sourceChildren.length === 0) {
            alert('No children found in the source month.');
            return;
        }
        
        // Get the current month children
        if (!appData.months[appData.currentMonth]) {
            appData.months[appData.currentMonth] = { children: [] };
        }
        const currentChildren = appData.months[appData.currentMonth].children;
        
        // Check if we should copy attendance
        const copyAttendance = document.getElementById('copy-attendance').checked;
        
        // Track how many children were copied
        let copiedCount = 0;
        let updatedCount = 0;
        
        // Copy each child from source month
        sourceChildren.forEach(sourceChild => {
            // Check if child already exists in current month
            const existingChild = currentChildren.find(child => child.name === sourceChild.name);
            
            if (existingChild) {
                // Update existing child if needed
                if (copyAttendance) {
                    // Copy regular attendance data if available
                    if (sourceChild.attendance) {
                        existingChild.attendance = JSON.parse(JSON.stringify(sourceChild.attendance));
                    }
                    
                    // Copy calendar attendance data if available
                    if (sourceChild.calendarAttendance) {
                        // Initialize calendar attendance for the target month if needed
                        if (!existingChild.calendarAttendance) {
                            existingChild.calendarAttendance = {};
                        }
                        
                        // Check if we have attendance data for the source month
                        if (sourceChild.calendarAttendance[sourceMonthKey]) {
                            // Copy the attendance data from source month to target month
                            // but store it under the current month key
                            existingChild.calendarAttendance[appData.currentMonth] = 
                                JSON.parse(JSON.stringify(sourceChild.calendarAttendance[sourceMonthKey]));
                            
                            console.log(`Copied calendar attendance for ${existingChild.name} from ${sourceMonthKey} to ${appData.currentMonth}`);
                        }
                    }
                    
                    updatedCount++;
                }
            } else {
                // Create a deep copy of the child
                const newChild = JSON.parse(JSON.stringify(sourceChild));
                
                // Generate a new ID for the child
                newChild.id = generateId();
                
                // Remove attendance data if not copying attendance
                if (!copyAttendance) {
                    newChild.attendance = initializeAttendance();
                    // Also clear calendar attendance data
                    if (newChild.calendarAttendance) {
                        delete newChild.calendarAttendance;
                    }
                } else if (copyAttendance && newChild.calendarAttendance) {
                    // For new children, we need to restructure the calendar attendance data
                    // to use the current month key instead of the source month key
                    const restructuredCalendarAttendance = {};
                    
                    // Check if we have attendance data for the source month
                    if (newChild.calendarAttendance[sourceMonthKey]) {
                        // Copy the attendance data from source month to target month
                        restructuredCalendarAttendance[appData.currentMonth] = 
                            JSON.parse(JSON.stringify(newChild.calendarAttendance[sourceMonthKey]));
                            
                        // Replace the calendar attendance with the restructured one
                        newChild.calendarAttendance = restructuredCalendarAttendance;
                        
                        console.log(`Restructured calendar attendance for new child ${newChild.name} from ${sourceMonthKey} to ${appData.currentMonth}`);
                    }
                }
                
                // Add to current month
                currentChildren.push(newChild);
                copiedCount++;
            }
        });
        
        // Save to localStorage
        saveAppData();
        
        // Update UI
        updateChildrenUI();
        updateInvoicesUI();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('copy-month-modal'));
        modal.hide();
        
        // Show success message
        if (copiedCount > 0 || updatedCount > 0) {
            let message = '';
            if (copiedCount > 0) {
                message += `${copiedCount} children copied. `;
            }
            if (updatedCount > 0) {
                message += `${updatedCount} existing children updated with attendance patterns.`;
            }
            alert(`Success! ${message}`);
        } else {
            alert('No changes were made. All children already exist in the current month.');
        }
    } catch (error) {
        console.error('Error copying from month:', error);
        alert('Error copying from month: ' + error.message);
    }
}
