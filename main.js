const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Set up the menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export All Invoices',
          click: () => {
            mainWindow.webContents.executeJavaScript('generateAllInvoices()');
          }
        },
        {
          label: 'Export to CSV',
          click: () => {
            mainWindow.webContents.executeJavaScript('exportToCSV()');
          }
        },
        { type: 'separator' },
        {
          label: 'Reset All Data',
          click: () => {
            mainWindow.webContents.executeJavaScript('confirmResetData()');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              alert('Nursery Invoice Generator v1.0.0\\n\\nA simple application for nursery staff to create printable monthly invoices based on attendance.');
            `);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
