// Children module
function initChildrenModule() {
    // Set up event listeners
    document.getElementById('add-child-btn').addEventListener('click', showAddChildModal);
    document.getElementById('save-child-btn').addEventListener('click', saveChild);
    document.getElementById('back-to-children-btn').addEventListener('click', showChildrenSection);
    
    // Initialize children table
    updateChildrenUI();
}

// Show the add child modal
function showAddChildModal() {
    // Reset form
    document.getElementById('add-child-form').reset();
    
    // Get the modal element
    const modalElement = document.getElementById('add-child-modal');
    
    // Use direct DOM manipulation to show the modal
    modalElement.style.display = 'block';
    modalElement.classList.add('show');
    document.body.classList.add('modal-open');
    
    // Create backdrop if it doesn't exist
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    }
    
    // Set focus to the name field
    setTimeout(() => {
        const nameInput = document.getElementById('child-name');
        if (nameInput) {
            nameInput.focus();
            
            // Add click event to ensure focus works
            nameInput.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }, 100);
    
    // Handle close button
    const closeButtons = modalElement.querySelectorAll('.btn-close, [data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeAddChildModal();
        });
    });
    
    // Handle cancel button
    const cancelButton = modalElement.querySelector('.btn-secondary');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            closeAddChildModal();
        });
    }
}

// Close the add child modal
function closeAddChildModal() {
    const modalElement = document.getElementById('add-child-modal');
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    document.body.classList.remove('modal-open');
    
    // Remove backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        document.body.removeChild(backdrop);
    }
}

// Save a new child
function saveChild() {
    const name = document.getElementById('child-name').value.trim();
    if (!name) {
        alert('Please enter the child\'s name');
        return;
    }
    
    const dob = document.getElementById('child-dob').value;
    if (!dob) {
        alert('Please enter the child\'s date of birth');
        return;
    }
    
    // Calculate age group based on date of birth
    const { ageGroup, freeHours } = calculateAgeGroup(dob);
    
    // Create child object
    const child = {
        id: generateId(),
        name: name,
        dob: dob,
        ageGroup: ageGroup,
        freeHours: freeHours,
        attendance: initializeAttendance()
    };
    
    // Add child to current month's data
    if (!appData.months[appData.currentMonth]) {
        appData.months[appData.currentMonth] = { children: [] };
    }
    appData.months[appData.currentMonth].children.push(child);
    
    // Save to localStorage
    saveAppData();
    
    // Update UI
    updateChildrenUI();
    
    // Close modal
    closeAddChildModal();
    
    // Show attendance section for the new child
    selectChild(child.id);
}

// Initialize empty attendance data
function initializeAttendance() {
    const attendance = [];
    
    // Create 4 weeks of attendance data
    for (let week = 0; week < 4; week++) {
        const weekData = {
            weekNumber: week + 1,
            days: {}
        };
        
        // For each day of the week (Monday to Friday)
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
            weekData.days[day] = {
                // For each time slot
                slots: {
                    'early': { type: null, duration: 1.25 }, // 7:45-9:00 (1.25 hours)
                    'morning': { type: null, duration: 2.5 }, // 9:00-11:30 (2.5 hours)
                    'lunch': { type: null, duration: 1 }, // 11:30-12:30 (1 hour)
                    'afternoon': { type: null, duration: 2.5 }, // 12:30-15:00 (2.5 hours)
                    'late': { type: null, duration: 2.5 } // 15:00-17:30 (2.5 hours)
                }
            };
        });
        
        attendance.push(weekData);
    }
    
    return attendance;
}

// Update the children table UI
function updateChildrenUI() {
    const tableBody = document.getElementById('children-list');
    tableBody.innerHTML = '';
    
    // Get children for current month
    const currentMonthData = appData.months[appData.currentMonth] || { children: [] };
    const children = currentMonthData.children;
    
    if (children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No children added for ' + formatMonthKey(appData.currentMonth) + '</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Update age groups based on current date for all children
    updateAgeGroupsForChildren(children);
    
    children.forEach(child => {
        const row = document.createElement('tr');
        const dobDate = new Date(child.dob);
        const formattedDob = dobDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        
        row.innerHTML = `
            <td>${child.name}</td>
            <td>${formattedDob}</td>
            <td>${child.ageGroup === 'under-3' ? 'Under 3 years' : '3-4 years'}</td>
            <td>
                <span class="badge bg-success">${child.freeHours} free hours/week</span>
                <small class="text-muted d-block">As per new law, all children are entitled to free hours</small>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-2 attendance-btn" data-child-id="${child.id}">
                    Set Attendance
                </button>
                <button class="btn btn-sm btn-danger delete-child-btn" data-child-id="${child.id}">
                    Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.attendance-btn').forEach(button => {
        button.addEventListener('click', function() {
            const childId = this.getAttribute('data-child-id');
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            if (child) {
                selectChild(childId);
            }
        });
    });
    
    document.querySelectorAll('.delete-child-btn').forEach(button => {
        button.addEventListener('click', function() {
            const childId = this.getAttribute('data-child-id');
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            if (child) {
                deleteChild(child);
            }
        });
    });
}

// Helper function to get children for the current month
function getCurrentMonthChildren() {
    if (!appData.months[appData.currentMonth]) {
        appData.months[appData.currentMonth] = { children: [] };
    }
    return appData.months[appData.currentMonth].children;
}

// Calculate age group based on date of birth
function calculateAgeGroup(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    
    // Calculate age in years
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Determine age group and free hours
    // As per new law, all children are entitled to free hours
    if (age >= 3 && age < 5) {
        return { ageGroup: '3-4', freeHours: 30 };
    } else {
        // Updated to provide free hours for under-3 children as well
        return { ageGroup: 'under-3', freeHours: 15 };
    }
}

// Update age groups for all children based on current date
function updateAgeGroupsForChildren(children) {
    const today = new Date();
    
    children.forEach(child => {
        if (child.dob) {
            const { ageGroup, freeHours } = calculateAgeGroup(child.dob);
            
            // Update child's age group and free hours if changed
            if (child.ageGroup !== ageGroup) {
                child.ageGroup = ageGroup;
                child.freeHours = freeHours;
                saveAppData(); // Save the updated data
            }
        }
    });
}

// Delete a child
function deleteChild(child) {
    showConfirmationModal(`Are you sure you want to delete ${child.name}?`, function() {
        // Remove child from current month data
        if (appData.months[appData.currentMonth]) {
            appData.months[appData.currentMonth].children = 
                appData.months[appData.currentMonth].children.filter(c => c.id !== child.id);
        }
        
        // Save to localStorage
        saveAppData();
        
        // Update UI
        updateChildrenUI();
        updateInvoicesUI();
    });
}

// Show the children section
function showChildrenSection() {
    document.getElementById('attendance-section').classList.add('d-none');
    document.getElementById('children-section').classList.remove('d-none');
}
