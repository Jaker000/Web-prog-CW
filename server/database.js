import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './server/race-results.db',
    driver: sqlite3.Database
  });
}

export async function setupDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bib TEXT,
      time TEXT,
      timestamp TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS race_start (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      start_time INTEGER
    );
  `);

  return db;
}

export async function setRaceStartTime(db, time) {
  const existing = await db.get('SELECT start_time FROM race_start WHERE id = 1');
  if (!existing) {
    await db.run('INSERT INTO race_start (id, start_time) VALUES (1, ?)', time);
    return true;
  }
  return false;
}

export async function getRaceStartTime(db) {
  const row = await db.get('SELECT start_time FROM race_start WHERE id = 1');
  return row ? row.start_time : null;
}
