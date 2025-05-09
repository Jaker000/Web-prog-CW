const startButton = document.querySelector('.startRace');
const stopButton = document.querySelector('.stopRace');
const recordButton = document.querySelector('.recordTime');
const resetButton = document.querySelector('.clearResults');
const bibInput = document.querySelector('.bibInput');
const finishList = document.querySelector('.results');
const raceTimer = document.querySelector('#raceTimer');

let raceStartTime = null;
let timerInterval = null;

function formatTime(ms) {
  const date = new Date(ms);
  return date.toISOString().substr(11, 8) + '.' + Math.floor(ms % 1000 / 10).toString().padStart(2, '0');
}

async function fetchStartTime() {
  try {
    const res = await fetch('/start-time');
    const data = await res.json();
    if (data.startTime) {
      const parsed = Date.parse(data.startTime);
      if (!isNaN(parsed)) {
        localStorage.setItem('raceStartTime', data.startTime);
        return parsed;
      }
    }
  } catch {
    const localTime = localStorage.getItem('raceStartTime');
    const parsed = Date.parse(localTime);
    return !isNaN(parsed) ? parsed : null;
  }
  return null;
}

function startTimer() {
  if (!raceStartTime) return;

  startButton.disabled = true;
  stopButton.disabled = false;
  recordButton.disabled = false;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - raceStartTime;
    raceTimer.textContent = formatTime(elapsed);
  }, 100);
}

startButton.addEventListener('click', async () => {
  const res = await fetch('/start-time');
  const data = await res.json();

  if (data.startTime) {
    alert("Race already started at: " + new Date(data.startTime).toLocaleTimeString());
    return;
  }

  const now = new Date().toISOString();
  await fetch('/start-time', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startTime: now })
  });

  localStorage.setItem('raceStartTime', now);
  raceStartTime = Date.parse(now);
  startTimer();
});

stopButton.addEventListener('click', () => {
  if (!raceStartTime) return;
  clearInterval(timerInterval);
  recordButton.disabled = true;
  stopButton.disabled = true;
});

recordButton.addEventListener('click', async () => {
  if (!raceStartTime) {
    alert("Race is not running!");
    return;
  }

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
    body: JSON.stringify({ results: [result] })
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
  localStorage.removeItem('raceStartTime');
  raceTimer.textContent = '00:00:00.00';
  recordButton.disabled = true;
  stopButton.disabled = true;
  startButton.disabled = false;
  finishList.innerHTML = '';
});

window.addEventListener('DOMContentLoaded', async () => {
  raceStartTime = await fetchStartTime();
  if (raceStartTime) {
    startTimer();
  }
});
