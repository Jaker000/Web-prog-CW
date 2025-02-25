const startButton = document.querySelector('.startRace');
const recordButton = document.querySelector('.recordTime');
const finishList = document.querySelector('.results');

let raceStartTime = null;

startButton.addEventListener('click', () => {
    raceStartTime = Date.now();
    recordButton.disabled = false;
    finishList.innerHTML = ''; 
    console.log("Race started!");
});

recordButton.addEventListener('click', () => {
    if (!raceStartTime) return;

    const elapsedTime = (Date.now() - raceStartTime) / 1000; 
    const listItem = document.createElement('li');
    listItem.textContent = `Runner finished at ${elapsedTime.toFixed(2)} seconds`;
    finishList.appendChild(listItem);
});
