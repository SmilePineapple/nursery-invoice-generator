// Main application logic
console.log('Script loaded - before DOMContentLoaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    try {
        console.log('Starting application initialization');
        
        // Check if jQuery is loaded
        if (window.jQuery) {
            console.log('jQuery is loaded:', $.fn.jquery);
        } else {
            console.log('jQuery is NOT loaded');
        }
        
        // Check if Bootstrap is loaded
        if (window.bootstrap) {
            console.log('Bootstrap JS is loaded');
        } else {
            console.log('Bootstrap JS is NOT loaded');
        }
        
        // Initialize current month if needed
        console.log('Initializing current month');
        initializeCurrentMonth();
        
        // Load data from localStorage if available
        console.log('Loading app data');
        loadAppData();
        
        // Initialize the application
        console.log('Initializing app');
        initApp();
        
        // Set up navigation
        console.log('Setting up navigation');
        setupNavigation();
        
        // Update UI
        console.log('Updating UI');
        updateAllUI();
        
        // Initialize backup module
        console.log('Initializing backup module');
        if (typeof initBackupModule === 'function') {
            initBackupModule();
        } else {
            console.warn('Backup module not loaded');
        }
        
        // Add test event listener to document
        document.addEventListener('click', function(e) {
            console.log('Document clicked:', e.target);
        });
        
        console.log('Application fully initialized');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

// Log any errors that occur
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', message, 'at', source, lineno, colno, error);
    return false;
};

// Global variables
const APP_DATA_KEY = 'nurseryInvoiceData';
let appData = {
    currentMonth: getCurrentMonthKey(),
    months: {},
    settings: {
        pricing: {
            early: 5.00,
            standard: 5.30,
            late: 10.00
        },
        nursery: {
            name: '',
            address: '',
            contact: '',
            logo: null
        },
        invoice: {
            bankDetails: 'Please make payment to: Account Name: Nursery Account, Sort Code: 00-00-00, Account Number: 12345678',
            accreditation: true,
            footer: 'Payment due by: ',
            paymentDueDay: 15
        }
    }
};

// Initialize the current month
function initializeCurrentMonth() {
    if (!appData.months[appData.currentMonth]) {
        appData.months[appData.currentMonth] = {
            children: []
        };
    }
}

// Get current month key in format YYYY-MM
function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Format month key for display
function formatMonthKey(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
}

// Initialize the application
function initApp() {
    console.log('Initializing application');
    
    // Initialize Bootstrap components
    initBootstrapComponents();
    
    // Initialize modules
    initMonthSelectorModule();
    initChildrenModule();
    initAttendanceModule();
    initInvoicesModule();
    initSettingsModule();
    initMonthCopyModule();
    
    // Set up direct event listeners for critical buttons
    setupButtonEventListeners();
}

// Update all UI components
function updateAllUI() {
    try {
        updateMonthSelectorUI();
        updateChildrenUI();
        updateInvoicesUI();
        updateSettingsUI();
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Set up direct event listeners for critical buttons
function setupButtonEventListeners() {
    // Navigation tabs
    document.getElementById('nav-children').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('children-section');
        updateActiveNavItem(this);
    });
    
    document.getElementById('nav-invoices').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('invoices-section');
        updateActiveNavItem(this);
    });
    
    document.getElementById('nav-settings').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('settings-section');
        updateActiveNavItem(this);
    });
    // Set Attendance button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('attendance-btn')) {
            e.preventDefault();
            console.log('Set Attendance button clicked');
            const childId = e.target.getAttribute('data-child-id');
            console.log('Child ID:', childId);
            
            // Get the child object
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            if (!child) {
                console.error('Child not found');
                return;
            }
            
            console.log('Child found:', child.name);
            
            // Hide all sections except attendance
            document.getElementById('children-section').classList.add('d-none');
            document.getElementById('invoices-section').classList.add('d-none');
            document.getElementById('settings-section').classList.add('d-none');
            document.getElementById('attendance-section').classList.remove('d-none');
            
            // Update child name in attendance section
            const attendanceTitleElement = document.getElementById('attendance-title');
            if (attendanceTitleElement) {
                attendanceTitleElement.textContent = 'Attendance for ' + child.name;
            }
            
            // Set current child ID for attendance module
            window.currentChildId = childId;
            
            // Use the selectChild function from attendance.js
            try {
                // Call the selectChild function which will handle calendar generation
                selectChild(childId);
                console.log('Calendar generation initiated via selectChild');
                
                // Update attendance legend
                if (typeof updateAttendanceLegend === 'function') {
                    updateAttendanceLegend();
                    console.log('Attendance legend updated');
                }
            } catch (error) {
                console.error('Error generating calendar:', error);
            }
        }
        
        // View Invoice button
        if (e.target && e.target.classList.contains('view-invoice-btn')) {
            e.preventDefault();
            console.log('View Invoice button clicked');
            const childId = e.target.getAttribute('data-child-id');
            console.log('Child ID:', childId);
            
            // Get the child object
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            if (!child) {
                console.error('Child not found');
                return;
            }
            
            console.log('Child found:', child.name);
            
            try {
                // Check if modal element exists
                const modalElement = document.getElementById('invoice-preview-modal');
                if (!modalElement) {
                    console.error('Invoice preview modal element not found');
                    return;
                }
                
                // Show invoice preview
                showInvoicePreview(child);
                console.log('Invoice preview shown successfully');
            } catch (error) {
                console.error('Error showing invoice preview:', error);
            }
        }
    });
}

// Initialize Bootstrap components
function initBootstrapComponents() {
    // Enable all tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Set up navigation between sections
function setupNavigation() {
    console.log('Setting up navigation');
    
    // Direct event handlers for each tab
    const navChildren = document.getElementById('nav-children');
    const navInvoices = document.getElementById('nav-invoices');
    const navSettings = document.getElementById('nav-settings');
    
    console.log('Navigation elements found:', {
        'nav-children': navChildren ? 'exists' : 'missing',
        'nav-invoices': navInvoices ? 'exists' : 'missing',
        'nav-settings': navSettings ? 'exists' : 'missing'
    });
    
    if (navChildren) {
        navChildren.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Children tab clicked');
            showSection('children');
        });
    } else {
        console.error('Children nav element not found');
    }
    
    if (navInvoices) {
        navInvoices.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Invoices tab clicked - BEFORE showSection');
            showSection('invoices');
            console.log('Invoices tab clicked - AFTER showSection');
            
            // Force check visibility after a short delay
            setTimeout(() => {
                const invoicesSection = document.getElementById('invoices-section');
                if (invoicesSection) {
                    console.log('Invoices section visibility after delay:', 
                        invoicesSection.classList.contains('d-none') ? 'hidden' : 'visible');
                    
                    // Try forcing visibility
                    console.log('Forcing invoices section visibility');
                    document.getElementById('children-section').classList.add('d-none');
                    document.getElementById('settings-section').classList.add('d-none');
                    invoicesSection.classList.remove('d-none');
                }
            }, 100);
        });
    } else {
        console.error('Invoices nav element not found');
    }
    
    if (navSettings) {
        navSettings.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Settings tab clicked - BEFORE showSection');
            showSection('settings');
            console.log('Settings tab clicked - AFTER showSection');
            
            // Force check visibility after a short delay
            setTimeout(() => {
                const settingsSection = document.getElementById('settings-section');
                if (settingsSection) {
                    console.log('Settings section visibility after delay:', 
                        settingsSection.classList.contains('d-none') ? 'hidden' : 'visible');
                    
                    // Try forcing visibility
                    console.log('Forcing settings section visibility');
                    document.getElementById('children-section').classList.add('d-none');
                    document.getElementById('invoices-section').classList.add('d-none');
                    settingsSection.classList.remove('d-none');
                }
            }, 100);
        });
    } else {
        console.error('Settings nav element not found');
    }
    
    // Helper function to show a section
    function showSection(sectionId) {
        console.log('Showing section:', sectionId);
        
        // Debug: Check if sections exist
        const childrenSection = document.getElementById('children-section');
        const invoicesSection = document.getElementById('invoices-section');
        const settingsSection = document.getElementById('settings-section');
        
        console.log('Sections found:', {
            'children-section': childrenSection ? 'exists' : 'missing',
            'invoices-section': invoicesSection ? 'exists' : 'missing',
            'settings-section': settingsSection ? 'exists' : 'missing'
        });
        
        // Debug: Check current visibility state
        console.log('Current visibility state:', {
            'children-section': childrenSection ? (childrenSection.classList.contains('d-none') ? 'hidden' : 'visible') : 'N/A',
            'invoices-section': invoicesSection ? (invoicesSection.classList.contains('d-none') ? 'hidden' : 'visible') : 'N/A',
            'settings-section': settingsSection ? (settingsSection.classList.contains('d-none') ? 'hidden' : 'visible') : 'N/A'
        });
        
        // Hide all sections
        if (childrenSection) childrenSection.classList.add('d-none');
        if (invoicesSection) invoicesSection.classList.add('d-none');
        if (settingsSection) settingsSection.classList.add('d-none');
        
        // Also hide attendance section if it exists
        const attendanceSection = document.getElementById('attendance-section');
        if (attendanceSection) {
            attendanceSection.classList.add('d-none');
        }
        
        // Show the selected section
        const sectionToShow = document.getElementById(sectionId + '-section');
        if (sectionToShow) {
            console.log('Showing section:', sectionId + '-section');
            sectionToShow.classList.remove('d-none');
        } else {
            console.error('Section not found:', sectionId + '-section');
        }
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const navLink = document.getElementById('nav-' + sectionId);
        if (navLink) {
            navLink.classList.add('active');
        } else {
            console.error('Nav link not found:', 'nav-' + sectionId);
        }
        
        // Debug: Check final visibility state
        console.log('Final visibility state:', {
            'children-section': childrenSection ? (childrenSection.classList.contains('d-none') ? 'hidden' : 'visible') : 'N/A',
            'invoices-section': invoicesSection ? (invoicesSection.classList.contains('d-none') ? 'hidden' : 'visible') : 'N/A',
            'settings-section': settingsSection ? (settingsSection.classList.contains('d-none') ? 'hidden' : 'visible') : 'N/A'
        });
    }
}

// Add global event listener for Set Attendance and View Invoice buttons
document.addEventListener('click', function(e) {
        // Handle Set Attendance button
        if (e.target && e.target.classList.contains('attendance-btn')) {
            e.preventDefault();
            console.log('Set Attendance button clicked');
            const childId = e.target.getAttribute('data-child-id');
            console.log('Child ID:', childId);
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            console.log('Child object:', child);
            
            if (child) {
                // Hide all sections except attendance
                document.getElementById('children-section').classList.add('d-none');
                document.getElementById('invoices-section').classList.add('d-none');
                document.getElementById('settings-section').classList.add('d-none');
                document.getElementById('attendance-section').classList.remove('d-none');
                
                // Update child name in attendance section
                const attendanceChildNameElement = document.getElementById('attendance-child-name');
                console.log('Attendance child name element:', attendanceChildNameElement);
                if (attendanceChildNameElement) {
                    attendanceChildNameElement.textContent = child.name;
                }
                
                // Update attendance title if child name element doesn't exist
                const attendanceTitleElement = document.getElementById('attendance-title');
                if (attendanceTitleElement) {
                    attendanceTitleElement.textContent = 'Attendance for ' + child.name;
                }
                
                // Generate calendar view
                console.log('Generating calendar view');
                try {
                    // Use the simplified calendar view function from attendance_simplified.js
                    generateSimplifiedCalendarView(child);
                    console.log('Calendar view generated successfully');
                } catch (error) {
                    console.error('Error generating calendar view:', error);
                }
                
                // Update attendance legend
                try {
                    // Use the simplified attendance legend function
                    updateSimplifiedAttendanceLegend();
                    console.log('Attendance legend updated successfully');
                } catch (error) {
                    console.error('Error updating attendance legend:', error);
                }
                
                // Set current child ID for attendance module
                currentChildId = childId;
                console.log('Current child ID set to:', currentChildId);
            }
        }
        
        // Handle View Invoice button
        if (e.target && e.target.classList.contains('view-invoice-btn')) {
            e.preventDefault();
            console.log('View Invoice button clicked');
            const childId = e.target.getAttribute('data-child-id');
            console.log('Child ID:', childId);
            const child = getCurrentMonthChildren().find(c => c.id === childId);
            console.log('Child object:', child);
            
            if (child) {
                // Make sure we're in the invoices section
                document.getElementById('children-section').classList.add('d-none');
                document.getElementById('attendance-section').classList.add('d-none');
                document.getElementById('settings-section').classList.add('d-none');
                document.getElementById('invoices-section').classList.remove('d-none');
                
                // Update nav links
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                document.getElementById('nav-invoices').classList.add('active');
                
                // Show invoice preview
                console.log('Showing invoice preview');
                try {
                    // Check if modal element exists
                    const modalElement = document.getElementById('invoice-preview-modal');
                    console.log('Modal element:', modalElement);
                    
                    if (!modalElement) {
                        console.error('Invoice preview modal element not found');
                        alert('Invoice preview modal not found. Please check the HTML.');
                        return;
                    }
                    
                    showInvoicePreview(child);
                    console.log('Invoice preview shown successfully');
                } catch (error) {
                    console.error('Error showing invoice preview:', error);
                    alert('Error showing invoice preview: ' + error.message);
                }
            }
        }
    });

// Month selector module
function initMonthSelectorModule() {
    // Set up event listeners for month selector
    document.getElementById('month-selector').addEventListener('change', function() {
        appData.currentMonth = this.value;
        saveAppData();
        updateChildrenUI();
        updateInvoicesUI();
        // Update the current month display
        document.getElementById('current-month-display').textContent = formatMonthKey(appData.currentMonth);
    });
    
    // Set up event listener for add month button
    document.getElementById('add-month-btn').addEventListener('click', function() {
        // Pre-populate the year field with current year
        document.getElementById('new-year').value = new Date().getFullYear();
        // Pre-select current month
        const currentDate = new Date();
        const currentMonthValue = String(currentDate.getMonth() + 1).padStart(2, '0');
        document.getElementById('new-month').value = currentMonthValue;
        
        // Show add month modal
        const modalElement = document.getElementById('add-month-modal');
        
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
        
        // Set focus to the year field after the modal is shown
        modalElement.addEventListener('shown.bs.modal', function () {
            document.getElementById('new-year').focus();
        }, { once: true });
    });
    
    // Set up event listener for save month button
    document.getElementById('save-month-btn').addEventListener('click', function() {
        addNewMonth();
    });
    
    // Update the month selector UI
    updateMonthSelectorUI();
    
    // Update the current month display
    document.getElementById('current-month-display').textContent = formatMonthKey(appData.currentMonth);
}

// Update the month selector UI
function updateMonthSelectorUI() {
    const selector = document.getElementById('month-selector');
    selector.innerHTML = '';
    
    // Get all months from appData
    const months = Object.keys(appData.months);
    
    // Sort months chronologically
    months.sort();
    
    // Add options for each month
    months.forEach(monthKey => {
        const option = document.createElement('option');
        option.value = monthKey;
        option.textContent = formatMonthKey(monthKey);
        selector.appendChild(option);
    });
    
    // Select current month
    selector.value = appData.currentMonth;
}

// Add a new month
function addNewMonth() {
    const month = document.getElementById('new-month').value;
    const year = document.getElementById('new-year').value;
    
    // Validate inputs
    if (!month || !year) {
        alert('Please select both month and year.');
        return;
    }
    
    // Create month key in format YYYY-MM
    const monthKey = `${year}-${month}`;
    
    // Check if month already exists
    if (appData.months[monthKey]) {
        alert('This month already exists.');
        return;
    }
    
    // Add new month to app data
    appData.months[monthKey] = {
        children: []
    };
    
    // Set as current month
    appData.currentMonth = monthKey;
    
    // Save to localStorage
    saveAppData();
    
    // Update UI
    updateMonthSelectorUI();
    updateChildrenUI();
    updateInvoicesUI();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-month-modal'));
    modal.hide();
}

// Save application data to localStorage
function saveAppData() {
    try {
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(appData));
    } catch (error) {
        console.error('Error saving app data:', error);
        alert('Failed to save data. Please make sure your browser supports local storage.');
    }
}

// Load application data from localStorage
function loadAppData() {
    console.log('Loading app data from localStorage');
    try {
        const savedData = localStorage.getItem(APP_DATA_KEY);
        if (savedData) {
            console.log('Found saved data in localStorage');
            const parsedData = JSON.parse(savedData);
            
            // Debug: Log the structure of the saved data
            console.log('Saved data structure:', Object.keys(parsedData));
            if (parsedData.months) {
                console.log('Months in saved data:', Object.keys(parsedData.months));
                
                // Check if current month exists in saved data
                const currentMonthKey = getCurrentMonthKey();
                console.log('Current month key:', currentMonthKey);
                
                if (parsedData.months[currentMonthKey]) {
                    console.log('Current month exists in saved data');
                    console.log('Children count in current month:', 
                        parsedData.months[currentMonthKey].children ? 
                        parsedData.months[currentMonthKey].children.length : 0);
                    
                    // Check for attendance data in children
                    if (parsedData.months[currentMonthKey].children && 
                        parsedData.months[currentMonthKey].children.length > 0) {
                        
                        parsedData.months[currentMonthKey].children.forEach((child, index) => {
                            console.log(`Child ${index} (${child.name}) attendance data:`, 
                                child.calendarAttendance ? 
                                JSON.parse(JSON.stringify(child.calendarAttendance)) : 
                                'No attendance data');
                        });
                    }
                } else {
                    console.log('Current month does not exist in saved data');
                }
            } else {
                console.log('No months data in saved data');
            }
            
            // Validate the parsed data structure
            if (parsedData && typeof parsedData === 'object') {
                // Ensure all required properties exist
                if (!parsedData.currentMonth) {
                    console.log('No currentMonth in saved data, using default');
                    parsedData.currentMonth = getCurrentMonthKey();
                }
                
                if (!parsedData.months) {
                    console.log('No months in saved data, using default');
                    parsedData.months = {};
                }
                
                if (!parsedData.settings) {
                    console.log('No settings in saved data, using default');
                    parsedData.settings = appData.settings;
                } else {
                    // Ensure all settings properties exist
                    if (!parsedData.settings.pricing) {
                        parsedData.settings.pricing = appData.settings.pricing;
                    }
                    if (!parsedData.settings.nursery) {
                        parsedData.settings.nursery = appData.settings.nursery;
                    }
                    if (!parsedData.settings.invoice) {
                        parsedData.settings.invoice = appData.settings.invoice;
                    }
                }
                
                // Update appData with validated data
                console.log('Updating appData with validated saved data');
                appData = parsedData;
                
                // Make sure current month is initialized
                initializeCurrentMonth();
                
                // Debug: Log the structure of appData after loading
                console.log('appData after loading:', Object.keys(appData));
                if (appData.months) {
                    console.log('Months in appData:', Object.keys(appData.months));
                    
                    // Check if current month exists in appData
                    if (appData.months[appData.currentMonth]) {
                        console.log('Current month exists in appData');
                        console.log('Children count in current month:', 
                            appData.months[appData.currentMonth].children ? 
                            appData.months[appData.currentMonth].children.length : 0);
                        
                        // Check for attendance data in children
                        if (appData.months[appData.currentMonth].children && 
                            appData.months[appData.currentMonth].children.length > 0) {
                            
                            appData.months[appData.currentMonth].children.forEach((child, index) => {
                                console.log(`Child ${index} (${child.name}) attendance data after loading:`, 
                                    child.calendarAttendance ? 
                                    JSON.parse(JSON.stringify(child.calendarAttendance)) : 
                                    'No attendance data');
                            });
                        }
                    } else {
                        console.log('Current month does not exist in appData');
                    }
                } else {
                    console.log('No months data in appData');
                }
                
                // Update UI with loaded data
                updateChildrenUI();
                updateInvoicesUI();
                updateSettingsUI();
                
                console.log('Data loaded successfully');
            } else {
                throw new Error('Invalid data structure');
            }
        } else {
            console.log('No saved data found in localStorage');
        }
    } catch (error) {
        console.error('Error loading app data:', error);
        // Don't show an alert, just log the error
        console.log('Starting with default settings');
        
        // Initialize current month
        initializeCurrentMonth();
    }
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

// Show a specific section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-container').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show the requested section
    document.getElementById(sectionId).classList.remove('d-none');
}

// Update active navigation item
function updateActiveNavItem(activeItem) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-link').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the clicked item
    activeItem.classList.add('active');
}

// Helper function to show confirmation modal
function showConfirmationModal(message, confirmCallback) {
    const modalElement = document.getElementById('confirmation-modal');
    
    // Remove any existing modal instance to prevent issues
    if (bootstrap.Modal.getInstance(modalElement)) {
        bootstrap.Modal.getInstance(modalElement).dispose();
    }
    
    // Create a new modal instance
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true
    });
    
    document.getElementById('confirmation-message').textContent = message;
    
    // Set up confirm button action
    const confirmBtn = document.getElementById('confirm-action-btn');
    const oldClickHandler = confirmBtn.onclick;
    
    confirmBtn.onclick = function() {
        confirmCallback();
        modal.hide();
        
        // Reset the click handler
        setTimeout(() => {
            confirmBtn.onclick = oldClickHandler;
        }, 100);
    };
    
    modal.show();
}

// Helper function to create a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
