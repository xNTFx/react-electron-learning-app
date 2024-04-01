import { ipcMain } from 'electron';

import { Statement } from '../../types/APITypes';
import db from './sqLite';

export default function sqLitePostRequests() {
  ipcMain.handle('add-flashcard', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const {
        deckId,
        frontWord,
        backWord,
        audioName,
        frontWordHTML,
        backWordHTML,
        frontDescHTML,
        backDescHTML,
      } = data;

      const sql = `INSERT INTO vocabulary (
        deck_id,
        front_word, 
        back_word,
        audio_name,
        front_word_html, 
        back_word_html, 
        front_desc_html, 
        back_desc_html
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run(
        sql,
        [
          deckId,
          frontWord,
          backWord,
          audioName,
          frontWordHTML,
          backWordHTML,
          frontDescHTML,
          backDescHTML,
        ],
        function (this: Statement, err: Error) {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            //Get id of inserted item
            resolve({ flashcardId: this.lastID });
          }
        },
      );
    });
  });

  ipcMain.handle('create-deck', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deck_name } = data;

      const sql = `INSERT INTO decks (
        deck_name
      ) VALUES (?)`;

      db.run(sql, [deck_name], function (this: Statement, err: Error) {
        if (err) {
          reject(new Error('Database error: ' + err.message));
        } else {
          resolve({ deck_id: this.lastID, deck_name });
        }
      });
    });
  });

  ipcMain.handle('create-review', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { vocabularyId } = data;

      const sql = `INSERT INTO reviews (
        vocabulary_id, review_date
      ) VALUES (?)`;

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
