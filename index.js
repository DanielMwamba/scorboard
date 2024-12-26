const ws = new WebSocket("wss://lotto-r7aq.onrender.com/");

ws.onopen = () => console.log("WebSocket connected");
ws.onerror = (error) => console.error("WebSocket error:", error);

const sendUpdate = (data) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    console.error("WebSocket is not open");
  }
};

const updateScore = (team, points) => {
  const scoreElement = document.getElementById(`${team}Score`);
  const newScore = Math.max(parseInt(scoreElement.value) + points, 0);
  scoreElement.value = newScore;
  sendUpdate({ [`${team}Score`]: newScore });
};

// Team A controls
document
  .getElementById("teamAPlus1")
  .addEventListener("click", () => updateScore("teamA", 1));
document
  .getElementById("teamAPlus2")
  .addEventListener("click", () => updateScore("teamA", 2));
document
  .getElementById("teamAPlus3")
  .addEventListener("click", () => updateScore("teamA", 3));
document
  .getElementById("teamAMinus1")
  .addEventListener("click", () => updateScore("teamA", -1));
document
  .getElementById("teamAMinus2")
  .addEventListener("click", () => updateScore("teamA", -2));
document
  .getElementById("teamAMinus3")
  .addEventListener("click", () => updateScore("teamA", -3));

// Team B controls
document
  .getElementById("teamBPlus1")
  .addEventListener("click", () => updateScore("teamB", 1));
document
  .getElementById("teamBPlus2")
  .addEventListener("click", () => updateScore("teamB", 2));
document
  .getElementById("teamBPlus3")
  .addEventListener("click", () => updateScore("teamB", 3));
document
  .getElementById("teamBMinus1")
  .addEventListener("click", () => updateScore("teamB", -1));
document
  .getElementById("teamBMinus2")
  .addEventListener("click", () => updateScore("teamB", -2));
document
  .getElementById("teamBMinus3")
  .addEventListener("click", () => updateScore("teamB", -3));

// Game Timer
let gameTimerInterval;
const gameTimer = document.getElementById("gameTimer");

const startGameTimer = () => {
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  let [minutes, seconds] = gameTimer.value.split(":").map(Number);

  gameTimerInterval = setInterval(() => {
    if (seconds === 0 && minutes === 0) {
      clearInterval(gameTimerInterval);
      sendUpdate({ gameTimer: "00:00" });
      return;
    }

    if (seconds === 0) {
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }

    gameTimer.value = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
    sendUpdate({ gameTimer: gameTimer.value });
  }, 1000);
};

document.getElementById("startTimer").addEventListener("click", startGameTimer);
document
  .getElementById("stopTimer")
  .addEventListener("click", () => clearInterval(gameTimerInterval));
document.getElementById("resetTimer").addEventListener("click", () => {
  clearInterval(gameTimerInterval);
  gameTimer.value = "10:00";
  sendUpdate({ gameTimer: "10:00" });
});

// Shot Clock
let shotClockInterval;
const shotClock = document.getElementById("shotClock");

const startShotClock = () => {
  if (shotClockInterval) clearInterval(shotClockInterval);
  let seconds = parseInt(shotClock.value);

  shotClockInterval = setInterval(() => {
    if (seconds === 0) {
      clearInterval(shotClockInterval);
      sendUpdate({ shotClock: "00" });
      return;
    }

    seconds--;
    shotClock.value = String(seconds).padStart(2, "0");
    sendUpdate({ shotClock: shotClock.value });
  }, 1000);
};

document
  .getElementById("startShotClock")
  .addEventListener("click", startShotClock);
document
  .getElementById("stopShotClock")
  .addEventListener("click", () => clearInterval(shotClockInterval));
document.getElementById("resetShotClock").addEventListener("click", () => {
  clearInterval(shotClockInterval);
  shotClock.value = "24";
  sendUpdate({ shotClock: "24" });
});

// Save Changes
document.getElementById("saveChanges").addEventListener("click", () => {
  const data = {
    teamAName: document.getElementById("teamAName").value,
    teamBName: document.getElementById("teamBName").value,
    period: document.getElementById("period").value,
    teamAScore: document.getElementById("teamAScore").value,
    teamBScore: document.getElementById("teamBScore").value,
    gameTimer: document.getElementById("gameTimer").value,
    shotClock: document.getElementById("shotClock").value,
  };

  sendUpdate(data);
  alert("Changes saved and sent to overlay!");
});
