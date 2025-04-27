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
    )
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

app.listen(PORT, async () => {
  await setupDb();
  console.log(`Server running at http://localhost:${PORT}`);
});
