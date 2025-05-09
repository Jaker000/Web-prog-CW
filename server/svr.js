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
      timestamp TEXT,
      race_id TEXT
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT,
      race_id TEXT
    );
  `);
}

app.post('/upload', async (req, res) => {
  const { results, raceId } = req.body;

  if (!Array.isArray(results) || !raceId) {
    return res.status(400).json({ message: "Invalid data format or missing raceId." });
  }

  const insertPromises = results.map(result => {
    return db.run(
      'INSERT INTO results (bib, time, timestamp, race_id) VALUES (?, ?, ?, ?)',
      result.bib || 'Unknown',
      result.time,
      result.timestamp,
      raceId
    );
  });

  await Promise.all(insertPromises);
  console.log(`Stored ${results.length} results for race "${raceId}"`);
  res.json({ message: "Results uploaded and saved!" });
});

app.get('/results', async (req, res) => {
  const raceId = req.query.raceId;
  if (!raceId) {
    return res.status(400).json({ message: 'Missing raceId in query.' });
  }

  const rows = await db.all(
    'SELECT bib, time, timestamp FROM results WHERE race_id = ? ORDER BY id ASC',
    raceId
  );
  res.json(rows);
});

app.post('/reset-results', async (req, res) => {
  try {
    await db.run('DELETE FROM results');
    await db.run('DELETE FROM meta');
    console.log('All results and meta data cleared.');
    res.sendStatus(200);
  } catch (err) {
    console.error('Failed to clear results:', err.message);
    res.status(500).send('Error clearing results');
  }
});

app.post('/start-time', async (req, res) => {
  const { startTime, raceId } = req.body;
  if (!raceId || !startTime) {
    return res.status(400).send('Missing raceId or startTime.');
  }

  try {
    await db.run(
      `INSERT OR REPLACE INTO meta (key, value, race_id) VALUES ('startTime', ?, ?)`,
      startTime,
      raceId
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Failed to set start time:', err.message);
    res.status(500).send('Failed to set start time');
  }
});

app.get('/start-time', async (req, res) => {
  const raceId = req.query.raceId;
  if (!raceId) {
    return res.status(400).json({ startTime: null, error: 'Missing raceId' });
  }

  const row = await db.get(`SELECT value FROM meta WHERE key = 'startTime' AND race_id = ?`, raceId);
  res.json({ startTime: row?.value || null });
});

app.listen(PORT, async () => {
  await setupDb();
  console.log(`Server running at http://localhost:${PORT}`);
});
