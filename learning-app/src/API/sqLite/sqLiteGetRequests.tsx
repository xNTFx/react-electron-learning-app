import { ipcMain } from 'electron';

import {
  GetDeckWithCountType,
  GetDecksType,
  GetVocabularyToReview,
  VocabularyType,
} from '../../types/APITypes';
import db from './sqLite';

export default function sqLiteGetRequests() {
  ipcMain.handle('get-decks', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM decks', [], (err: Error, rows: GetDecksType) => {
        if (err) {
          reject(new Error('Database error: ' + err.message));
        } else {
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('get-decks-with-limit', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { limit, offset } = data;
      db.all(
        `SELECT decks.*,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN reviews.repetition = 1 THEN 1 ELSE 0 END), 0) > 999 
          THEN '+999'
          ELSE CAST(COALESCE(SUM(CASE WHEN reviews.repetition = 1 THEN 1 ELSE 0 END), 0) AS CHAR)
        END AS new,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN reviews.repetition > 1 AND julianday('now') > julianday(reviews.review_date) THEN 1 ELSE 0 END), 0) > 999 
          THEN '+999'
          ELSE CAST(COALESCE(SUM(CASE WHEN reviews.repetition > 1 AND julianday('now') > julianday(reviews.review_date) THEN 1 ELSE 0 END), 0) AS CHAR)
        END AS review
      FROM decks
      LEFT JOIN vocabulary ON vocabulary.deck_id = decks.deck_id 
      LEFT JOIN reviews ON reviews.vocabulary_id = vocabulary.vocabulary_id
      GROUP BY decks.deck_id
        LIMIT ? OFFSET ?`,
        [limit, offset],
        (err: Error, rows: GetDeckWithCountType) => {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            resolve(rows);
          }
        },
      );
    });
  });

  ipcMain.handle('get-deck-by-id', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deckId } = data;
      db.all(
        `SELECT decks.*,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN reviews.repetition = 1 THEN 1 ELSE 0 END), 0) > 999 
          THEN '+999'
          ELSE CAST(COALESCE(SUM(CASE WHEN reviews.repetition = 1 THEN 1 ELSE 0 END), 0) AS CHAR)
        END AS new,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN reviews.repetition > 1 AND julianday('now') > julianday(reviews.review_date) THEN 1 ELSE 0 END), 0) > 999 
          THEN '+999'
          ELSE CAST(COALESCE(SUM(CASE WHEN reviews.repetition > 1 AND julianday('now') > julianday(reviews.review_date) THEN 1 ELSE 0 END), 0) AS CHAR)
        END AS review
      FROM decks
      LEFT JOIN vocabulary ON vocabulary.deck_id = decks.deck_id 
      LEFT JOIN reviews ON reviews.vocabulary_id = vocabulary.vocabulary_id
      WHERE decks.deck_id = ?
      GROUP BY decks.deck_id`,
        [deckId],
        (err: Error, rows: GetDeckWithCountType) => {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            resolve(rows);
          }
        },
      );
    });
  });

  ipcMain.handle('get-vocabulary-to-delete-deck', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deckId } = data;
      db.all(
        `SELECT vocabulary.* FROM vocabulary 
        WHERE vocabulary.deck_id = ?`,
        [deckId],
        (err: Error, rows: VocabularyType) => {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            resolve(rows);
          }
        },
      );
    });
  });

  ipcMain.handle('get-vocabulary-to-browse', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deckId, limit, offset, search } = data;
      db.all(
        `SELECT vocabulary.*, decks.deck_name FROM vocabulary
        JOIN decks ON decks.deck_id = vocabulary.deck_id
        WHERE (vocabulary.deck_id = ? OR ? = 0) AND (vocabulary.front_word LIKE ?)
        LIMIT ? OFFSET ?`,
        [deckId, deckId, search, limit, offset],
        (err: Error, rows: VocabularyType) => {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            resolve(rows);
          }
        },
      );
    });
  });

  ipcMain.handle('get-vocabulary-to-remove-deck', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deckId } = data;
      db.all(
        `SELECT vocabulary.* FROM vocabulary
        JOIN decks ON decks.deck_id = vocabulary.deck_id
        WHERE vocabulary.deck_id = ?`,
        [deckId],
        (err: Error, rows: VocabularyType) => {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            resolve(rows);
          }
        },
      );
    });
  });

  ipcMain.handle('check-if-img-or-audio-exists', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { vocabularyId, html } = data;
      db.all(
        `SELECT IIF(COUNT(vocabulary.vocabulary_id) > 0, true, false) AS count FROM vocabulary 
        WHERE vocabulary.vocabulary_id != ? AND (
        vocabulary.audio_name LIKE ? OR 
        vocabulary.front_desc_html LIKE ? OR 
        vocabulary.back_desc_html LIKE ?)
        `,
        [vocabularyId, html, html, html],
        (err: Error, rows: VocabularyType) => {
          if (err) {
            reject(new Error('Database error: ' + err.message));
          } else {
            resolve(rows);
          }
        },
      );
    });
  });

  ipcMain.handle('get-vocabulary-to-review', async (_event, data) => {
    return new Promise((resolve, reject) => {
      const { deckId, limit, type } = data;
      if (type === 'new-reviews') {
        db.all(
          `SELECT reviews.*, vocabulary.* FROM reviews  
          JOIN vocabulary ON vocabulary.vocabulary_id = reviews.vocabulary_id
          WHERE deck_id = ? AND julianday('now') > julianday(reviews.review_date) AND reviews.repetition > 1 LIMIT ?`,
          [deckId, limit],
          (err: Error, rows: GetVocabularyToReview[]) => {
            if (err) {
              reject(new Error('Database error: ' + err.message));
            } else {
              resolve(rows);
            }
          },
        );
      } else {
        db.all(
          `SELECT reviews.*, vocabulary.* FROM reviews  
          JOIN vocabulary ON vocabulary.vocabulary_id = reviews.vocabulary_id
          WHERE deck_id = ? AND reviews.repetition = 1 LIMIT ?`,
          [deckId, limit],
          (err: Error, rows: GetVocabularyToReview[]) => {
            if (err) {
              reject(new Error('Database error: ' + err.message));
            } else {
              resolve(rows);
            }
          },
        );
      }
    });
  });
}
