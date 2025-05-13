document.addEventListener('DOMContentLoaded', () => {
  let currentRaceId = null;

  const raceIdInput = document.querySelector('#raceIdInput');
  const loadButton = document.querySelector('#loadRace');
  const downloadButton = document.querySelector('#downloadCSV');
  const resultList = document.querySelector('#resultsList');
  const raceStartDisplay = document.querySelector('#raceStartDisplay');

  function formatResults(results) {
    resultList.innerHTML = '';

    if (results.length === 0) {
      resultList.innerHTML = '<li>No results uploaded yet.</li>';
      return;
    }

    results.forEach((result, i) => {
      const item = document.createElement('li');
      item.textContent = `#${i + 1} | Bib: ${result.bib ?? 'Unknown'} | Time: ${result.time}`;
      resultList.appendChild(item);
    });
  }

  async function fetchResults() {
    if (!currentRaceId) return;

    try {
      const res = await fetch(`/results?raceId=${encodeURIComponent(currentRaceId)}`);
      const data = await res.json();
      formatResults(data);
    } catch (err) {
      console.error('Error loading results:', err);
      resultList.innerHTML = '<li>Error loading results</li>';
    }
  }

  async function displayStartTime() {
    if (!currentRaceId) return;
    try {
      const res = await fetch(`/start-time?raceId=${encodeURIComponent(currentRaceId)}`);
      const { startTime } = await res.json();

      if (startTime) {
        const date = new Date(startTime);
        raceStartDisplay.textContent = `Race started: ${date.toLocaleString('en-GB')}`;
      } else {
        raceStartDisplay.textContent = 'Race has not started yet.';
      }
    } catch (err) {
      raceStartDisplay.textContent = 'Error loading start time.';
    }
  }

  async function downloadCSV() {
    if (!currentRaceId) return alert("Please load a race first.");

    try {
      const res = await fetch(`/results?raceId=${encodeURIComponent(currentRaceId)}`);
      const results = await res.json();

      if (results.length === 0) {
        alert("No results to download.");
        return;
      }

      const headers = ['Position', 'Bib', 'Time', 'Timestamp'];
      const rows = results.map((r, i) => [
        i + 1,
        r.bib ?? 'Unknown',
        r.time,
        new Date(r.timestamp).toLocaleString('en-GB')
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `race-${currentRaceId}-results.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV download failed:', err);
      alert("Something went wrong while exporting.");
    }
  }

  loadButton.addEventListener('click', () => {
    currentRaceId = raceIdInput.value.trim();
    if (!currentRaceId) return alert("Please enter a Race ID.");
    fetchResults();
    displayStartTime();
    setInterval(fetchResults, 2000);
  });

  downloadButton.addEventListener('click', downloadCSV);
});
