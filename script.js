let countdownInterval = null;
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release().then(() => { wakeLock = null; });
  }
}

function updateDisplay(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const dayEl = document.getElementById('day');
  const addEl = document.getElementById('add');

  if (days > 0) {
    dayEl.style.display = 'inline-block';
    addEl.style.display = 'inline-block';
    dayEl.textContent = String(days).padStart(2, '0');
  } else {
    dayEl.style.display = 'none';
    addEl.style.display = 'none';
  }

  document.getElementById('hr').textContent = String(hours).padStart(2, '0');
  document.getElementById('min').textContent = String(minutes).padStart(2, '0');
  document.getElementById('sec').textContent = String(seconds).padStart(2, '0');
}

function startCountdown(endTime) {
  if (countdownInterval) clearInterval(countdownInterval);

  requestWakeLock();

  function tick() {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    updateDisplay(remaining);

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      releaseWakeLock();
    }
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  releaseWakeLock();
  updateDisplay(0);
}

// Listen to Firebase for real-time timer updates
db.ref('timer').on('value', (snapshot) => {
  const data = snapshot.val();
  const clockEl = document.getElementById('clock');
  const waitingEl = document.getElementById('waitingMsg');

  if (!data || !data.active) {
    stopCountdown();
    clockEl.style.display = 'none';
    waitingEl.style.display = 'flex';
    return;
  }

  // Apply color
  if (data.color) {
    clockEl.style.color = data.color;
  }

  const remaining = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));

  if (remaining > 0) {
    waitingEl.style.display = 'none';
    clockEl.style.display = 'flex';
    startCountdown(data.endTime);
  } else {
    stopCountdown();
    clockEl.style.display = 'none';
    waitingEl.style.display = 'flex';
  }
});
