let timer;
    let totalSeconds = 0;
    let showDay = false;
    let wakeLock = null;

    async function requestWakeLock() {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock is active');
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    }

    function releaseWakeLock() {
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => {
            wakeLock = null;
            console.log('Wake Lock is released');
          });
      }
    }

    function showClock() {
      const d = parseInt(document.getElementById('days').value) || 0;
      const h = parseInt(document.getElementById('hours').value) || 0;
      const m = parseInt(document.getElementById('minutes').value) || 0;
      const s = parseInt(document.getElementById('seconds').value) || 0;

      totalSeconds = d * 86400 + h * 3600 + m * 60 + s;

      if (totalSeconds <= 0) {
        alert("Please enter a valid time.");
        return;
      }

      showDay = d > 0;

      document.getElementById('inputContainer').style.display = 'none';
      document.getElementById('clock').style.display = 'flex';
      document.getElementById('beginBtn').style.display = 'inline-block';

      if (showDay) {
        document.getElementById('day').style.display = 'inline-block';
        document.getElementById('dayColon').style.display = 'inline-block';
      } else {
        document.getElementById('day').style.display = 'none';
        document.getElementById('add').style.display = 'none';
      }

      updateDisplay(totalSeconds);
    }

    function startCountdown() {
      document.getElementById('beginBtn').style.display = 'none';
      requestWakeLock();
      timer = setInterval(() => {
        totalSeconds--;
        if (totalSeconds < 0) {
          clearInterval(timer);
          releaseWakeLock();
          alert("Time's up!");
          return;
        }
        updateDisplay(totalSeconds);
      }, 1000);
    }

    function stopCountdown() {
      clearInterval(timer);
      releaseWakeLock();
      totalSeconds = 0;
      updateDisplay(0);

      document.getElementById('inputContainer').style.display = 'flex';
      document.getElementById('clock').style.display = 'none';
      document.getElementById('beginBtn').style.display = 'none';

      document.getElementById('days').value = '';
      document.getElementById('hours').value = '';
      document.getElementById('minutes').value = '';
      document.getElementById('seconds').value = '';
    }

    function updateDisplay(totalSeconds) {
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      document.getElementById('day').textContent = String(days).padStart(2, '0');
      document.getElementById('hr').textContent = String(hours).padStart(2, '0');
      document.getElementById('min').textContent = String(minutes).padStart(2, '0');
      document.getElementById('sec').textContent = String(seconds).padStart(2, '0');
    }