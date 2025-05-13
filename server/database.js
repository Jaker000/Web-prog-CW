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
      timestamp TEXT,
      race_id TEXT
    );
  `);
  return db;
}
