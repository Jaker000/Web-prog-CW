let currentRaceId = null;

function loadRace() {
  const input = document.querySelector('#raceIdInput');
  currentRaceId = input.value.trim();
  if (!currentRaceId) {
    alert('Please enter a Race ID.');
    return;
  }

  localStorage.setItem('currentRaceId', currentRaceId);
  fetchResults();
  displayStartTime();
  setInterval(fetchResults, 2000);
}


async function fetchResults() {
  if (!currentRaceId) return;

  try {
    const response = await fetch(`/results?raceId=${encodeURIComponent(currentRaceId)}`);
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
  if (!currentRaceId) return;

  const res = await fetch(`/start-time?raceId=${encodeURIComponent(currentRaceId)}`);
  const { startTime } = await res.json();

  const display = document.querySelector('raceStartDisplay');
  if (startTime) {
    const date = new Date(startTime);
    if (!isNaN(date)) {
      display.textContent = `Race started: ${date.toLocaleString('en-GB')}`;
    } else {
      display.textContent = 'Race start time is invalid.';
    }
  } else {
    display.textContent = 'Race has not started yet.';
  }
}
window.addEventListener('load', () => {
  const storedId = localStorage.getItem('currentRaceId');
  if (storedId) {
    document.querySelector('#raceIdInput').value = storedId;
    currentRaceId = storedId;
    fetchResults();
    displayStartTime();
    setInterval(fetchResults, 2000);
  }
});
