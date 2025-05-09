async function fetchResults() {
  try {
    const response = await fetch('/results');
    const results = await response.json();
    const list = document.querySelector('#resultsList');
    list.innerHTML = '';

    if (results.length === 0) {
      list.innerHTML = '<li>No results uploaded yet.</li>';
      return;
    }

    results.forEach((result, i) => {
      const item = document.createElement('li');
      item.textContent = `#${i + 1} | Bib: ${result.bib ?? 'Unknown'} | Time: ${result.time}`;
      list.appendChild(item);
    });
  } catch (err) {
    console.error('Failed to load results', err);
    document.querySelector('#resultsList').innerHTML = '<li>Error loading results</li>';
  }
}

async function displayStartTime() {
  const res = await fetch('/start-time');
  const { startTime } = await res.json();

  const display = document.createElement('p');
  display.style.fontWeight = 'bold';
  display.style.marginTop = '1rem';

  if (startTime) {
    const date = new Date(startTime);
    if (!isNaN(date)) {
      const formatted = date.toLocaleString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      display.textContent = `Race started: ${formatted}`;
    } else {
      display.textContent = 'Race start time is invalid.';
    }
  } else {
    display.textContent = 'Race has not started yet.';
  }

  document.querySelector('.top-bar').appendChild(display);
}

document.querySelector('#downloadCSV').addEventListener('click', async () => {
  try {
    const response = await fetch('/results');
    const results = await response.json();

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

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'race-results.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export CSV', err);
    alert("Something went wrong while exporting.");
  }
});

window.addEventListener('load', () => {
  fetchResults();
  displayStartTime();
  setInterval(fetchResults, 2000);
});


