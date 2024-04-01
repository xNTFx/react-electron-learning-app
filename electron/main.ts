import { BrowserWindow, app, protocol } from 'electron';
import fs from 'fs';
import path from 'node:path';

import NodeRequests from '../../electron-vite-project/src/API/nodeFileSystem/NodeRequests';
import sqLiteDeleteRequests from '../../electron-vite-project/src/API/sqLite//sqLiteDeleteRequest';
import db from '../../electron-vite-project/src/API/sqLite/sqLite';
import sqLiteGetRequests from '../../electron-vite-project/src/API/sqLite/sqLiteGetRequests';
import sqLitePostRequests from '../../electron-vite-project/src/API/sqLite/sqLitePostRequests';
import sqLiteUpdateRequests from '../../electron-vite-project/src/API/sqLite/sqLiteUpdateRequest';

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    minWidth: 680,
    minHeight: 520,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  nativeTheme.themeSource = "dark";

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

//Alowing using files outside of the project
app.on('ready', () => {
  protocol.registerFileProtocol('local-file', (request, callback) => {
    const url = request.url.replace('local-file:///', '');
    const safePath = path.normalize(decodeURIComponent(url));
    callback({ path: safePath });
  });
});

app.on('ready', () => {
  const dirName = 'dataResources';

  const appPath = app.getAppPath();
  const targetPath = path.join(appPath, dirName);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  const imagesPath = path.join(targetPath, 'mediaFiles/images');
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
  }

  const audioPath = path.join(targetPath, 'mediaFiles/audio');
  if (!fs.existsSync(audioPath)) {
    fs.mkdirSync(audioPath, { recursive: true });
  }
});

//Node file system request functions
NodeRequests();

sqLiteGetRequests();
sqLitePostRequests();
sqLiteUpdateRequests();
sqLiteDeleteRequests();

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  db.close();
});

app.whenReady().then(() => {
  createWindow();
});
