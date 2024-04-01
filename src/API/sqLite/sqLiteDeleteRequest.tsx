import { ipcMain } from 'electron';

import { Statement } from '../../types/APITypes';
import db from './sqLite';

export default function sqLiteDeleteRequests() {
  ipcMain.handle('delete-deck', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deckId } = data;

      const sql = `DELETE FROM decks WHERE deck_id = ?`;

      db.run(sql, [deckId], function (this: Statement, err: Error) {
        if (err) {
          reject(new Error('Database error: ' + err.message));
        } else {
          resolve({ deckId: this.lastID });
        }
      });
    });
  });

  ipcMain.handle('delete-vocabulary', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { vocabularyId } = data;

      const sql = `DELETE FROM vocabulary WHERE vocabulary_id = ?`;

      db.run(sql, [vocabularyId], function (this: Statement, err: Error) {
        if (err) {
          reject(new Error('Database error: ' + err.message));
        } else {
          resolve({ vocabularyId: this.lastID });
        }
      });
    });
  });
}
