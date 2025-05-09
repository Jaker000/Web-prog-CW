import express from 'express';
import { openDb } from './database.js';

const app = express();
const PORT = 8080;

app.use(express.static('./client'));
app.use(express.json());

let db;

async function setupDb() {
  db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bib TEXT,
      time TEXT,
      timestamp TEXT
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

app.post('/upload', async (req, res) => {
  const { results } = req.body;

  if (!Array.isArray(results)) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  const insertPromises = results.map(result => {
    return db.run(
      'INSERT INTO results (bib, time, timestamp) VALUES (?, ?, ?)',
      result.bib || 'Unknown',
      result.time,
      result.timestamp
    );
  });

  await Promise.all(insertPromises);
  console.log(`Stored ${results.length} results into database.`);
  res.json({ message: "Results uploaded and saved!" });
});

app.get('/results', async (req, res) => {
  const rows = await db.all('SELECT bib, time, timestamp FROM results ORDER BY id ASC');
  res.json(rows);
});

app.post('/reset-results', async (req, res) => {
  try {
    await db.run('DELETE FROM results');
    await db.run(`DELETE FROM meta WHERE key = 'startTime'`);
    console.log('All results and race start time cleared.');
    res.sendStatus(200);
  } catch (err) {
    console.error('Failed to clear results:', err.message);
    res.status(500).send('Error clearing results');
  }
});

app.post('/start-time', async (req, res) => {
  const { startTime } = req.body;
  try {
    await db.run(`INSERT OR REPLACE INTO meta (key, value) VALUES ('startTime', ?)`, startTime);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Failed to set start time');
  }
});

app.get('/start-time', async (req, res) => {
  const row = await db.get(`SELECT value FROM meta WHERE key = 'startTime'`);
  res.json({ startTime: row?.value || null });
});

app.listen(PORT, async () => {
  await setupDb();
  console.log(`Server running at http://localhost:${PORT}`);
});
