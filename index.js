// WebSocket setup
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => console.log("WebSocket connected");
ws.onerror = (error) => console.error("WebSocket error:", error);

// Helper: Send data via WebSocket
const sendUpdate = (data) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    console.error("WebSocket is not open. Cannot send data.");
  }
};

// Global state
const state = {
  gameTimerInterval: null,
  shotClockInterval: null,
};

// Helper: Safely update scores
const updateScore = (team, points) => {
  const scoreElement = document.getElementById(`${team}Score`);
  if (!scoreElement) {
    console.error(`Score element for ${team} not found.`);
    return;
  }

  const currentScore = parseInt(scoreElement.value) || 0;
  const newScore = Math.max(currentScore + points, 0); // Prevent negative scores
  scoreElement.value = newScore;

  sendUpdate({ [`${team}Score`]: newScore });
};

// Helper: Attach score controls
const attachScoreControls = (team) => {
  const scoreModifiers = [1, 2, 3, -1, -2, -3];
  scoreModifiers.forEach((modifier) => {
    const button = document.getElementById(
      `${team}${modifier > 0 ? "Plus" : "Minus"}${Math.abs(modifier)}`
    );
    if (button) {
      button.addEventListener("click", () => updateScore(team, modifier));
    }
  });
};

// Game Timer
const handleGameTimer = {
  start: () => {
    if (state.gameTimerInterval) clearInterval(state.gameTimerInterval);

    const gameTimer = document.getElementById("gameTimer");
    if (!gameTimer) {
      console.error("Game Timer element not found.");
      return;
    }

    let [minutes, seconds] = gameTimer.value.split(":").map(Number);

    state.gameTimerInterval = setInterval(() => {
      if (seconds === 0 && minutes === 0) {
        clearInterval(state.gameTimerInterval);
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
  },
  stop: () => clearInterval(state.gameTimerInterval),
  reset: () => {
    clearInterval(state.gameTimerInterval);
    const gameTimer = document.getElementById("gameTimer");
    if (gameTimer) {
      gameTimer.value = "10:00";
      sendUpdate({ gameTimer: "10:00" });
    }
  },
};

// Shot Clock
const handleShotClock = {
  start: () => {
    if (state.shotClockInterval) clearInterval(state.shotClockInterval);

    const shotClock = document.getElementById("shotClock");
    if (!shotClock) {
      console.error("Shot Clock element not found.");
      return;
    }

    let seconds = parseInt(shotClock.value);

    state.shotClockInterval = setInterval(() => {
      if (seconds === 0) {
        clearInterval(state.shotClockInterval);
        sendUpdate({ shotClock: "00" });
        return;
      }

      seconds--;
      shotClock.value = String(seconds).padStart(2, "0");
      sendUpdate({ shotClock: shotClock.value });
    }, 1000);
  },
  stop: () => clearInterval(state.shotClockInterval),
  reset: () => {
    clearInterval(state.shotClockInterval);
    const shotClock = document.getElementById("shotClock");
    if (shotClock) {
      shotClock.value = "24";
      sendUpdate({ shotClock: "24" });
    }
  },
};

// Save Changes
const saveChanges = () => {
  const data = {
    teamAName: document.getElementById("teamAName")?.value || "",
    teamBName: document.getElementById("teamBName")?.value || "",
    period: document.getElementById("period")?.value || "",
    teamAScore: document.getElementById("teamAScore")?.value || 0,
    teamBScore: document.getElementById("teamBScore")?.value || 0,
    gameTimer: document.getElementById("gameTimer")?.value || "10:00",
    shotClock: document.getElementById("shotClock")?.value || "24",
  };

  sendUpdate(data);
  alert("Changes saved and sent to overlay!");
};

// Initialize
const initialize = () => {
  // Attach score controls
  attachScoreControls("teamA");
  attachScoreControls("teamB");

  // Attach game timer controls
  document
    .getElementById("startTimer")
    ?.addEventListener("click", handleGameTimer.start);
  document
    .getElementById("stopTimer")
    ?.addEventListener("click", handleGameTimer.stop);
  document
    .getElementById("resetTimer")
    ?.addEventListener("click", handleGameTimer.reset);

  // Attach shot clock controls
  document
    .getElementById("startShotClock")
    ?.addEventListener("click", handleShotClock.start);
  document
    .getElementById("stopShotClock")
    ?.addEventListener("click", handleShotClock.stop);
  document
    .getElementById("resetShotClock")
    ?.addEventListener("click", handleShotClock.reset);

  // Attach save button
  document
    .getElementById("saveChanges")
    ?.addEventListener("click", saveChanges);
};

// Start the app
initialize();
