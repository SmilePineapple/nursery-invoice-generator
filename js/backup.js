// Backup and Restore functionality
let autoBackupInterval = null;

function initBackupModule() {
    // Set up event listeners
    document.getElementById('export-backup-btn').addEventListener('click', exportFullBackup);
    document.getElementById('import-backup-btn').addEventListener('click', importBackup);
    document.getElementById('import-backup-file').addEventListener('change', handleBackupFileSelection);
    document.getElementById('auto-backup-enabled').addEventListener('change', toggleAutoBackup);
    
    // Load auto-backup settings
    loadAutoBackupSettings();
    
    // Update recent backups list
    updateRecentBackupsList();
    
    // Check if it's time for auto-backup
    checkAutoBackup();
}

// Export full backup of all data
function exportFullBackup() {
    try {
        console.log('Creating full data backup...');
        
        // Get appData from global scope or localStorage
        const currentAppData = window.appData || JSON.parse(localStorage.getItem('appData') || '{}');
        console.log('AppData for backup:', currentAppData);
        
        // Create backup object with all application data
        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            appData: JSON.parse(JSON.stringify(currentAppData)), // Deep copy
            backupInfo: {
                totalChildren: getTotalChildrenCount(currentAppData),
                totalMonths: Object.keys(currentAppData.months || {}).length,
                createdBy: 'Nursery Invoice Generator',
                description: 'Full application data backup including all children, attendance records, and settings'
            }
        };
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `nursery-backup-${timestamp}.json`;
        
        // Create and download the backup file
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Store backup info in localStorage for recent backups list
        storeBackupInfo(filename, backupData.backupInfo);
        
        // Update recent backups list
        updateRecentBackupsList();
        
        // Show success message
        showBackupMessage('Backup exported successfully!', 'success');
        
        console.log('Backup exported successfully:', filename);
        
    } catch (error) {
        console.error('Error creating backup:', error);
        showBackupMessage('Error creating backup: ' + error.message, 'danger');
    }
}

// Handle backup file selection
function handleBackupFileSelection(event) {
    const file = event.target.files[0];
    const importBtn = document.getElementById('import-backup-btn');
    
    if (file) {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            importBtn.disabled = false;
            importBtn.textContent = `Import ${file.name}`;
        } else {
            importBtn.disabled = true;
            showBackupMessage('Please select a valid JSON backup file.', 'warning');
        }
    } else {
        importBtn.disabled = true;
        importBtn.innerHTML = '<i class="bi bi-upload"></i> Import Backup';
    }
}

// Import backup data
function importBackup() {
    const fileInput = document.getElementById('import-backup-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showBackupMessage('Please select a backup file first.', 'warning');
        return;
    }
    
    // Confirm with user before importing
    if (!confirm('Are you sure you want to import this backup? This will replace ALL current data. Make sure you have exported a current backup first!')) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // Validate backup data structure
            if (!validateBackupData(backupData)) {
                showBackupMessage('Invalid backup file format.', 'danger');
                return;
            }
            
            // Import the data
            console.log('Importing backup data...');
            
            // Replace current appData with backup data
            appData = JSON.parse(JSON.stringify(backupData.appData));
            
            // Save to localStorage
            localStorage.setItem('appData', JSON.stringify(appData));
            
            // Reinitialize the application with new data
            initializeCurrentMonth();
            updateAllUI();
            
            // Show success message
            showBackupMessage(`Backup imported successfully! Restored ${backupData.backupInfo.totalChildren} children across ${backupData.backupInfo.totalMonths} months.`, 'success');
            
            // Clear file input
            fileInput.value = '';
            document.getElementById('import-backup-btn').disabled = true;
            document.getElementById('import-backup-btn').innerHTML = '<i class="bi bi-upload"></i> Import Backup';
            
            console.log('Backup imported successfully');
            
        } catch (error) {
            console.error('Error importing backup:', error);
            showBackupMessage('Error importing backup: ' + error.message, 'danger');
        }
    };
    
    reader.readAsText(file);
}

// Validate backup data structure
function validateBackupData(backupData) {
    return backupData && 
           backupData.version && 
           backupData.appData && 
           backupData.timestamp &&
           typeof backupData.appData === 'object';
}

// Toggle automatic backup
function toggleAutoBackup() {
    const isEnabled = document.getElementById('auto-backup-enabled').checked;
    const settingsDiv = document.getElementById('auto-backup-settings');
    
    if (isEnabled) {
        settingsDiv.classList.remove('d-none');
        setupAutoBackup();
        localStorage.setItem('autoBackupEnabled', 'true');
        showBackupMessage('Automatic weekly backups enabled.', 'info');
    } else {
        settingsDiv.classList.add('d-none');
        clearAutoBackup();
        localStorage.setItem('autoBackupEnabled', 'false');
        showBackupMessage('Automatic backups disabled.', 'info');
    }
}

// Setup automatic backup
function setupAutoBackup() {
    clearAutoBackup(); // Clear any existing interval
    
    // Check every hour if it's time for backup
    autoBackupInterval = setInterval(checkAutoBackup, 60 * 60 * 1000);
}

// Clear automatic backup
function clearAutoBackup() {
    if (autoBackupInterval) {
        clearInterval(autoBackupInterval);
        autoBackupInterval = null;
    }
}

// Check if it's time for automatic backup
function checkAutoBackup() {
    const isEnabled = localStorage.getItem('autoBackupEnabled') === 'true';
    if (!isEnabled) return;
    
    const lastBackup = localStorage.getItem('lastAutoBackup');
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    
    // Check if it's Sunday and we haven't backed up this week
    if (dayOfWeek === 0) {
        const lastBackupDate = lastBackup ? new Date(lastBackup) : null;
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        if (!lastBackupDate || lastBackupDate < weekAgo) {
            console.log('Performing automatic weekly backup...');
            exportFullBackup();
            localStorage.setItem('lastAutoBackup', now.toISOString());
        }
    }
}

// Load auto-backup settings
function loadAutoBackupSettings() {
    const isEnabled = localStorage.getItem('autoBackupEnabled') === 'true';
    document.getElementById('auto-backup-enabled').checked = isEnabled;
    
    if (isEnabled) {
        document.getElementById('auto-backup-settings').classList.remove('d-none');
        setupAutoBackup();
    }
}

// Store backup info for recent backups list
function storeBackupInfo(filename, backupInfo) {
    let recentBackups = JSON.parse(localStorage.getItem('recentBackups') || '[]');
    
    // Add new backup info
    recentBackups.unshift({
        filename: filename,
        timestamp: new Date().toISOString(),
        info: backupInfo
    });
    
    // Keep only last 5 backups
    recentBackups = recentBackups.slice(0, 5);
    
    localStorage.setItem('recentBackups', JSON.stringify(recentBackups));
}

// Update recent backups list in UI
function updateRecentBackupsList() {
    const recentBackups = JSON.parse(localStorage.getItem('recentBackups') || '[]');
    const listContainer = document.getElementById('recent-backups-list');
    
    if (recentBackups.length === 0) {
        listContainer.innerHTML = '<div class="list-group-item text-muted">No recent backups found</div>';
        return;
    }
    
    listContainer.innerHTML = '';
    
    recentBackups.forEach(backup => {
        const backupDate = new Date(backup.timestamp).toLocaleString();
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div>
                <strong>${backup.filename}</strong>
                <br>
                <small class="text-muted">${backupDate} - ${backup.info.totalChildren} children, ${backup.info.totalMonths} months</small>
            </div>
            <span class="badge bg-primary rounded-pill">Backup</span>
        `;
        listContainer.appendChild(listItem);
    });
}

// Show backup message
function showBackupMessage(message, type) {
    // Create toast notification
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Get total children count across all months
function getTotalChildrenCount(data = null) {
    const dataToUse = data || window.appData || JSON.parse(localStorage.getItem('appData') || '{}');
    let totalChildren = 0;
    if (dataToUse.months) {
        Object.values(dataToUse.months).forEach(month => {
            if (month.children) {
                totalChildren += month.children.length;
            }
        });
    }
    return totalChildren;
}
