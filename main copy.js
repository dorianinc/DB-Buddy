const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Don't show the window until it's ready
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Load your application's HTML file or URL
    mainWindow.loadFile('index.html');

    // Handle the window close event
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide(); // Hide the window instead of closing it
        }
    });
}

// Create the tray icon
function createTray() {
    const iconPath = path.join(__dirname, 'icon.png'); // Ensure you have an icon file
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                mainWindow.show();
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            },
        },
    ]);

    tray.setToolTip('My Electron App');
    tray.setContextMenu(contextMenu);

    // Show the window when the tray icon is clicked
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    // Handle macOS-specific behavior
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
