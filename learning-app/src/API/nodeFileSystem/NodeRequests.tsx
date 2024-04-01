import { BrowserWindow, app, dialog, ipcMain } from 'electron';
import fs from 'fs-extra';
import path from 'node:path';

export default function NodeRequests() {
  ipcMain.on(
    'handle-image-insert',
    async (event, { uniqueFilename, fileType }) => {
      const appPath = app.getAppPath();
      const targetDir = path.join(
        appPath,
        'dataResources/mediaFiles',
        fileType,
      );
      const targetPath = path.join(targetDir, uniqueFilename);

      try {
        if (fs.existsSync(targetPath)) {
          const options = {
            buttons: ['Yes', 'No'],
            title: 'File Exists',
            message:
              'The file already exists. Do you want to insert an existing file?',
          };

          const mainWindow = BrowserWindow.getFocusedWindow();

          if (!mainWindow) return;

          dialog.showMessageBox(mainWindow, options).then((response) => {
            if (response.response === 0) {
              event.reply('image-inserted', true, 'insert-existing-file');
            }
          });
        } else {
          event.reply('image-inserted', true, 'insert-image-to-editor');
        }
      } catch (error) {
        console.error('Failed to handle the file:', error);
        event.reply('image-inserted', false, null);
      }
    },
  );

  //Inserting files to public file
  ipcMain.on(
    'copy-file-to-public',
    async (event, { filePath, uniqueFilename }) => {
      const appPath = app.getAppPath();

      const targetDir = path.join(appPath);

      fs.mkdir(targetDir, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err);
          return;
        }

        const targetPath = path.join(targetDir, uniqueFilename);

        if (!fs.existsSync(targetPath)) {
          fs.copyFile(filePath, targetPath, (copyErr) => {
            if (copyErr) {
              console.error('Failed to copy file:', copyErr);
              event.reply('file-copied', false, null);
            } else {
              event.reply('file-copied', true, targetPath.replace(appPath, ''));
            }
          });
        } else {
          event.reply('file-copied', false, null);
        }
      });
    },
  );

  ipcMain.on('remove-file-from-public', async (event, { uniqueFilename }) => {
    const appPath = app.getAppPath();
    const targetPath = path.join(appPath, uniqueFilename);
    if (fs.existsSync(targetPath)) {
      try {
        await fs.unlink(targetPath);
        event.reply('file-removed', true, targetPath);
      } catch (error) {
        console.error('Failed to copy file:', error);
        event.reply('file-removed', false, null);
      }
    }
  });

  ipcMain.on('check-if-file-exists', async (event, { uniqueFilename }) => {
    const appPath = app.getAppPath();
    const targetPath = path.join(
      appPath,
      'dataResources/mediaFiles/audio',
      uniqueFilename,
    );

    if (fs.existsSync(targetPath)) {
      const options = {
        buttons: ['Yes', 'No'],
        title: 'File Exists',
        message:
          'The file already exists. Do you want to insert an existing file?',
      };

      const mainWindow = BrowserWindow.getFocusedWindow();

      if (!mainWindow) return;

      dialog.showMessageBox(mainWindow, options).then((response) => {
        if (response.response === 0) {
          event.reply('file-exists', true, 'file-exists-insert-existing-file');
        } else {
          event.reply(
            'file-exists',
            false,
            'file-exists-do-not-insert-existing-file',
          );
        }
      });
    } else {
      event.reply('file-exists', true, 'file-does-not-exist');
    }
  });
}
