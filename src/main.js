const { app, BrowserWindow, ipcMain, screen, Menu, dialog } = require('electron');
const electronShortcut = require('electron-localshortcut');

const path = require('path');
const URL = require('url');
const isDev = require('electron-is-dev');

const main_controller = require('./controllers/main_controller');

const config = require('./config');

/**
 * When in development mode:
 * - Enable automatic reloads
 */
if (isDev) {
	require('electron-reload')(path.join(__dirname, '../'), {
    // Note that the path to electron may vary according to the main file
    electron: path.join(__dirname, '../', './node_modules/electron')
  });
}

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().rotation;
    // Path to root directory.
  const basePath = isDev ?  path.resolve(__dirname, '../') : app.getAppPath();

  // Create the browser window.
  let win = new BrowserWindow({
    title: config.appName,
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.resolve(basePath, './build/preload.js')
    },
    fullscreen: true,
	})

	// URL for index.html which will be our entry point.
	const indexURL = URL.format({
		pathname: path.resolve(basePath ,'./build/index.html'),
		protocol: 'file:',
		slashes: true
	});

  // and load the index.html of the app.
  win.loadURL(indexURL);

  win.on('close', (e) => {
    if (win) {
      // e.preventDefault();
      win.webContents.send('fromMain', 'app-close');
    }
  })

  // Register the shortcut for windows version
  electronShortcut.register(win, 'F12', () => {
    win.toggleDevTools();
  })

  // ipcEvents
  ipcMain.on('toMain', (e, props) => {
    //TODO: Extract the to Main handler when needed
    const parsePaths = (filePaths) => {
      return filePaths.map((filePath) => ({
        fullPath: filePath,
        basePath: path.basename(filePath),
        routingPath: filePath.replace('C:', '').replace(/\\/g, '/'),
      }))
    };

    if (props === 'select-file-dialog') {
      dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
        .then(resp => win.webContents.send('fromMain', {
          ...resp,
          name: 'from-select-file-dialog',
          filePaths: parsePaths(resp.filePaths)
        }))
        .catch(() => console.log('select file error'));
    }
  })

  ipcMain.on('toCurrentPage', (e, props) => {
    main_controller({win, app, props})
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Clean the menubar
  if (process.platform !== 'darwin') {
    const menu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(menu);
  }

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
