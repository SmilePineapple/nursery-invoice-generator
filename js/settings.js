// Settings module
function initSettingsModule() {
    // Set up event listeners
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('nursery-logo').addEventListener('change', handleLogoUpload);
    
    // Initialize settings form
    updateSettingsUI();
}

// Update the settings UI with current values
function updateSettingsUI() {
    // Pricing
    document.getElementById('price-early').value = appData.settings.pricing.early.toFixed(2);
    document.getElementById('price-standard').value = appData.settings.pricing.standard.toFixed(2);
    document.getElementById('price-late').value = appData.settings.pricing.late.toFixed(2);
    
    // Nursery details
    document.getElementById('nursery-name').value = appData.settings.nursery.name;
    document.getElementById('nursery-address').value = appData.settings.nursery.address;
    document.getElementById('nursery-contact').value = appData.settings.nursery.contact;
    
    // Invoice details
    document.getElementById('invoice-footer').value = appData.settings.invoice.footer || '';
    document.getElementById('bank-details').value = appData.settings.invoice.bankDetails || '';
    
    // Set payment due day
    const paymentDueDaySelect = document.getElementById('payment-due-day');
    if (paymentDueDaySelect) {
        const dueDay = appData.settings.invoice.paymentDueDay || 15;
        paymentDueDaySelect.value = dueDay.toString();
    }
    
    // Logo preview
    if (appData.settings.nursery.logo) {
        document.getElementById('logo-preview-container').classList.remove('d-none');
        document.getElementById('logo-preview').src = appData.settings.nursery.logo;
    } else {
        document.getElementById('logo-preview-container').classList.add('d-none');
    }
}

// Handle logo upload
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
        alert('Logo file is too large. Please select an image under 1MB.');
        event.target.value = '';
        return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
        alert('Please select an image file.');
        event.target.value = '';
        return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = function(e) {
        // Set logo in app data
        appData.settings.nursery.logo = e.target.result;
        
        // Show preview
        document.getElementById('logo-preview-container').classList.remove('d-none');
        document.getElementById('logo-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Save settings
function saveSettings() {
    // Get pricing values
    const earlyPrice = parseFloat(document.getElementById('price-early').value);
    const standardPrice = parseFloat(document.getElementById('price-standard').value);
    const latePrice = parseFloat(document.getElementById('price-late').value);
    
    // Validate pricing
    if (isNaN(earlyPrice) || isNaN(standardPrice) || isNaN(latePrice)) {
        alert('Please enter valid prices.');
        return;
    }
    
    // Update app data
    appData.settings.pricing.early = earlyPrice;
    appData.settings.pricing.standard = standardPrice;
    appData.settings.pricing.late = latePrice;
    
    // Get nursery details
    appData.settings.nursery.name = document.getElementById('nursery-name').value;
    appData.settings.nursery.address = document.getElementById('nursery-address').value;
    appData.settings.nursery.contact = document.getElementById('nursery-contact').value;
    
    // Get invoice details
    appData.settings.invoice.footer = document.getElementById('invoice-footer').value;
    appData.settings.invoice.bankDetails = document.getElementById('bank-details').value;
    
    // Get payment due day
    const paymentDueDaySelect = document.getElementById('payment-due-day');
    if (paymentDueDaySelect) {
        appData.settings.invoice.paymentDueDay = parseInt(paymentDueDaySelect.value, 10);
    }
    
    // Save to localStorage
    saveAppData();
    
    // Show success message
    alert('Settings saved successfully!');
    
    // Update invoices
    updateInvoicesUI();
}
