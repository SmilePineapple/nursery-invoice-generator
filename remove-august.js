// Script to remove August 2025 data while preserving all other data
function removeAugustData() {
    try {
        // Get the current data
        const APP_DATA_KEY = 'nurseryInvoiceData';
        const savedData = localStorage.getItem(APP_DATA_KEY);
        
        if (savedData) {
            // Parse the data
            const appData = JSON.parse(savedData);
            console.log('Current months:', Object.keys(appData.months));
            
            // Check if August 2025 exists
            if (appData.months && appData.months['2025-08']) {
                console.log('Found August 2025 data, removing it...');
                
                // Remove August 2025
                delete appData.months['2025-08'];
                
                // If current month is August, set it to July
                if (appData.currentMonth === '2025-08') {
                    appData.currentMonth = '2025-07';
                    console.log('Current month was August, changed to July');
                }
                
                // Save the updated data
                localStorage.setItem(APP_DATA_KEY, JSON.stringify(appData));
                console.log('Data saved. Remaining months:', Object.keys(appData.months));
                return 'August 2025 data removed successfully!';
            } else {
                return 'August 2025 data not found in storage.';
            }
        } else {
            return 'No data found in localStorage.';
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Error removing August data: ' + error.message;
    }
}

// Execute and display the result
document.getElementById('result').textContent = removeAugustData();
