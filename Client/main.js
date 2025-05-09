const startButton = document.querySelector('.startRace');
const recordButton = document.querySelector('.recordTime');
const resetButton = document.querySelector('.clearResults');
const raceIdInput = document.querySelector('.raceIdInput');
const bibInput = document.querySelector('.bibInput');
const finishList = document.querySelector('.results');
const raceTimer = document.querySelector('#raceTimer');

let raceStartTime = null;
let timerInterval = null;
let raceId = null;

function formatTime(ms) {
  const date = new Date(ms);
  return date.toISOString().substr(11, 8) + '.' + Math.floor(ms % 1000 / 10).toString().padStart(2, '0');
}

async function fetchStartTime() {
  raceId = raceIdInput.value.trim();
  if (!raceId) return null;

  try {
    const res = await fetch(`/start-time?raceId=${encodeURIComponent(raceId)}`);
    const data = await res.json();
    if (data.startTime) {
      const parsed = Date.parse(data.startTime);
      if (!isNaN(parsed)) return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function startTimer() {
  if (!raceStartTime) return;

  startButton.disabled = true;
  recordButton.disabled = false;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - raceStartTime;
    raceTimer.textContent = formatTime(elapsed);
  }, 100);
}

startButton.addEventListener('click', async () => {
  raceId = raceIdInput.value.trim();
  if (!raceId) return alert("Please enter a Race ID.");

  const res = await fetch(`/start-time?raceId=${encodeURIComponent(raceId)}`);
  const data = await res.json();

  if (data.startTime) {
    alert("Race already started at: " + new Date(data.startTime).toLocaleTimeString());
    return;
  }

  const now = new Date().toISOString();
  await fetch('/start-time', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raceId, startTime: now })
  });

  raceStartTime = Date.parse(now);
  startTimer();
});

recordButton.addEventListener('click', async () => {
  if (!raceStartTime) return alert("Race is not running!");
  if (!raceId) raceId = raceIdInput.value.trim();
  if (!raceId) return alert("Missing Race ID.");

  const bib = bibInput.value.trim() || 'Unknown';
  const elapsedTime = Date.now() - raceStartTime;

  const result = {
    bib,
    time: formatTime(elapsedTime),
    timestamp: new Date().toISOString()
  };

  await fetch('/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raceId, results: [result] })
  });

  const position = finishList.children.length + 1;
  const listItem = document.createElement('li');
  listItem.textContent = `#${position} | Bib: ${result.bib} | Time: ${result.time}`;
  finishList.appendChild(listItem);
  bibInput.value = '';
});

resetButton.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  raceStartTime = null;
  raceTimer.textContent = '00:00:00.00';
  recordButton.disabled = true;
  startButton.disabled = false;
  finishList.innerHTML = '';
});

window.addEventListener('DOMContentLoaded', async () => {
  raceId = raceIdInput.value.trim();
  raceStartTime = await fetchStartTime();
  if (raceStartTime) startTimer();
});
