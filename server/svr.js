import express from 'express';

const app = express();
const PORT = 8080;

app.use(express.static('./client'));
app.use(express.json());

let uploadedResults = [];

app.post('/upload', (req, res) => {
  const { results } = req.body;
  if (!Array.isArray(results)) {
    return res.status(400).json({ message: "'results' must be an array." });
  }

  uploadedResults = uploadedResults.concat(results);
  console.log("Received results:", results.length);
  res.json({ message: "Results uploaded successfully!" });
});

app.get('/results', (req, res) => {
  res.json(uploadedResults);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
