const startButton = document.querySelector('.startRace');
const stopButton = document.querySelector('.stopRace');
const recordButton = document.querySelector('.recordTime');
const submitButton = document.querySelector('.submitResults');
const clearButton = document.querySelector('.clearResults');
const bibInput = document.querySelector('.bibInput');
const finishList = document.querySelector('.results');
const raceTimer = document.querySelector('#raceTimer');

let raceStartTime = null;
let timerInterval = null;

function formatTime(ms) {
  const date = new Date(ms);
  return date.toISOString().substr(11, 8) + '.' + Math.floor(ms % 1000 / 10).toString().padStart(2, '0');
}

startButton.addEventListener('click', () => {
  if (raceStartTime !== null) {
    alert("Race already started!");
    return;
  }

  raceStartTime = Date.now();
  recordButton.disabled = false;
  stopButton.disabled = false;
  startButton.disabled = true;
  finishList.innerHTML = '';
  localStorage.removeItem('raceResults');

  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - raceStartTime;
    raceTimer.textContent = formatTime(elapsed);
  }, 100);

  console.log("Race started.");
});

stopButton.addEventListener('click', () => {
  if (raceStartTime === null) {
    alert("Race hasn't started yet!");
    return;
  }

  clearInterval(timerInterval);
  timerInterval = null;
  recordButton.disabled = true;
  stopButton.disabled = true;

  console.log("Race stopped.");
});

recordButton.addEventListener('click', () => {
  if (!raceStartTime || timerInterval === null) {
    alert("Race is not running!");
    return;
  }

  const bib = bibInput.value.trim() || 'Unknown';
  const elapsedTime = (Date.now() - raceStartTime);

  const result = {
    bib,
    time: formatTime(elapsedTime),
    timestamp: new Date().toISOString()
  };

  const savedResults = JSON.parse(localStorage.getItem('raceResults') || '[]');
  savedResults.push(result);
  localStorage.setItem('raceResults', JSON.stringify(savedResults));

  const position = savedResults.length;
  const listItem = document.createElement('li');
  listItem.textContent = `#${position} | Bib: ${result.bib} | Time: ${result.time}`;
  finishList.appendChild(listItem);

  bibInput.value = '';
});

submitButton.addEventListener('click', async () => {
  const savedResults = JSON.parse(localStorage.getItem('raceResults') || '[]');

  if (savedResults.length === 0) {
    alert("No results to submit!");
    return;
  }

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: savedResults })
    });

    const data = await response.json();
    alert(data.message || "Results submitted!");
  } catch (err) {
    console.error('Submit failed:', err);
    alert("Failed to upload results.");
  }
});

clearButton.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  raceStartTime = null;
  raceTimer.textContent = '00:00:00.00';
  recordButton.disabled = true;
  stopButton.disabled = true;
  startButton.disabled = false;
  finishList.innerHTML = '';
  localStorage.removeItem('raceResults');

  console.log("Race cleared.");
});

window.addEventListener('DOMContentLoaded', () => {
  const savedResults = JSON.parse(localStorage.getItem('raceResults') || '[]');

  if (savedResults.length > 0) {
    recordButton.disabled = false;
    savedResults.forEach((result, i) => {
      const li = document.createElement('li');
      li.textContent = `#${i + 1} | Bib: ${result.bib} | Time: ${result.time}`;
      finishList.appendChild(li);
    });
  }
});
