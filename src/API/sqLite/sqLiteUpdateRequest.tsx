import { ipcMain } from 'electron';

import { Statement } from '../../types/APITypes';
import db from './sqLite';

export default function sqLiteUpdateRequests() {
  ipcMain.handle('update-deck', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deckId, deckName } = data;

      const sql = `UPDATE decks
        SET deck_name = ?
        WHERE deck_id = ?`;

      db.run(sql, [deckName, deckId], function (this: Statement, err: Error) {
        if (err) {
          reject(new Error('Database error: ' + err.message));
        } else {
          //Get id of updated item
          resolve({ deckId: this.lastID });
        }
      });
    });
  });

  ipcMain.handle('update-vocabulary', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const {
        front_word,
        back_word,
        audio_name,
        front_word_html,
        back_word_html,
        front_desc_html,
        back_desc_html,
        vocabulary_id,
      } = data;

      const sql = `UPDATE vocabulary SET 
            front_word = ?,
            back_word = ?,
            audio_name = ?,
            front_word_html = ?,
            back_word_html = ?,
            front_desc_html = ?,
            back_desc_html = ? 
            WHERE vocabulary_id = ?`;

      db.run(
        sql,
        [
          front_word,
          back_word,
          audio_name,
          front_word_html,
          back_word_html,
          front_desc_html,
          back_desc_html,
          vocabulary_id,
        ],
        function (this: Statement, err: Error) {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            //Get id of updated item
            resolve({
              front_word,
              back_word,
              audio_name,
              front_word_html,
              back_word_html,
              front_desc_html,
              back_desc_html,
              vocabulary_id,
            });
          }
        },
      );
    });
  });

  ipcMain.handle('update-review', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const {
        reviewId,
        vocabularyId,
        reviewDate,
        easeFactor,
        repetition,
        interval,
      } = data;

      const sql = `UPDATE reviews
        SET vocabulary_id = ?, review_date = ?, ease_factor = ?, repetition = ?, interval = ?
        WHERE review_id = ?`;

      db.run(
        sql,
        [vocabularyId, reviewDate, easeFactor, repetition, interval, reviewId],
        function (this: Statement, err: Error) {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            //Get id of updated item
            resolve({ deckId: this.lastID });
          }
        },
      );
    });
  });
}
