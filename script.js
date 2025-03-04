// Each phase: { repeat: number, timers: [{ type, minutes, seconds }] }
let phases = [];
let running = false;
let wakeLock = null;
let wakeLockEnabled = false;
let currentTimerInterval = null; // holds the current timer interval

// Save the phases array to localStorage
function savePhases() {
  localStorage.setItem("phases", JSON.stringify(phases));
}

// Load phases from localStorage and render them
function loadPhases() {
  const stored = localStorage.getItem("phases");
  if (stored) {
    phases = JSON.parse(stored);
    renderPhases();
  }
}

// Render the phases in the setup area
function renderPhases() {
  const container = document.getElementById("phasesContainer");
  container.innerHTML = "";
  phases.forEach((phase, phaseIndex) => {
    const phaseDiv = document.createElement("div");
    phaseDiv.className = "phase";
    phaseDiv.id = `phase${phaseIndex}`;

    const header = document.createElement("h2");
    header.textContent = `Phase ${phaseIndex + 1}`;
    phaseDiv.appendChild(header);

    // Repeat count dropdown (values 1-10)
    const repeatLabel = document.createElement("label");
    repeatLabel.textContent = "Repeat:";
    phaseDiv.appendChild(repeatLabel);

    const repeatSelect = document.createElement("select");
    for (let i = 1; i <= 10; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (phase.repeat == i) {
        option.selected = true;
      }
      repeatSelect.appendChild(option);
    }
    repeatSelect.addEventListener("change", function () {
      phase.repeat = parseInt(this.value);
      savePhases();
    });
    phaseDiv.appendChild(repeatSelect);

    // Container for timers in this phase
    const timerContainer = document.createElement("div");
    timerContainer.className = "timerContainer";
    phaseDiv.appendChild(timerContainer);

    // Render each timer in this phase with emoji display
    phase.timers.forEach((timer) => {
      const timerDisplay = document.createElement("div");
      timerDisplay.className = "timer";
      const emoji = timer.type === "Work" ? "🚴‍♂️" : "🛌";
      timerDisplay.textContent = `${emoji} - ${String(
        timer.minutes
      ).padStart(2, "0")}:${String(timer.seconds).padStart(2, "0")}`;
      timerContainer.appendChild(timerDisplay);
    });

    // Controls to add a new timer to this phase
    const typeLabel = document.createElement("label");
    typeLabel.textContent = "Timer Type:";
    phaseDiv.appendChild(typeLabel);

    const typeSelect = document.createElement("select");
    typeSelect.style.width = "150px";
    const workOption = document.createElement("option");
    workOption.value = "Work";
    workOption.textContent = "🚴‍♂️";
    typeSelect.appendChild(workOption);
    const restOption = document.createElement("option");
    restOption.value = "Rest";
    restOption.textContent = "🛌";
    typeSelect.appendChild(restOption);
    phaseDiv.appendChild(typeSelect);

    const minLabel = document.createElement("label");
    minLabel.textContent = "Minutes:";
    phaseDiv.appendChild(minLabel);
    const minSelect = createDropdown(60);
    phaseDiv.appendChild(minSelect);

    const secLabel = document.createElement("label");
    secLabel.textContent = "Seconds:";
    phaseDiv.appendChild(secLabel);
    const secSelect = createDropdown(60);
    phaseDiv.appendChild(secSelect);

    const addTimerBtn = document.createElement("button");
    addTimerBtn.textContent = "Add Timer";
    addTimerBtn.addEventListener("click", function () {
      const minutes = parseInt(minSelect.value) || 0;
      const seconds = parseInt(secSelect.value) || 0;
      if (minutes === 0 && seconds === 0) return;
      const timerType = typeSelect.value;
      phase.timers.push({ type: timerType, minutes, seconds });
      savePhases();
      renderPhases(); // re-render to update the view
    });
    phaseDiv.appendChild(addTimerBtn);

    container.appendChild(phaseDiv);
  });
}

// Helper: Create a dropdown (select) with options from 0 to max-1.
function createDropdown(maxValue) {
  const select = document.createElement("select");
  for (let i = 0; i < maxValue; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i.toString().padStart(2, "0");
    select.appendChild(option);
  }
  return select;
}

async function requestWakeLock() {
  if ("wakeLock" in navigator && wakeLockEnabled) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake Lock is active");
    } catch (err) {
      console.error("Wake Lock request failed:", err);
    }
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release().then(() => {
      wakeLock = null;
      console.log("Wake Lock released");
    });
  }
}

document
  .getElementById("wakeLockToggle")
  .addEventListener("change", function () {
    wakeLockEnabled = this.checked;
    if (!wakeLockEnabled) {
      releaseWakeLock();
    }
  });

// Add a new phase and save it
function addPhase() {
  const phase = {
    repeat: 1, // default repeat count
    timers: [], // each timer is { type, minutes, seconds }
  };
  phases.push(phase);
  savePhases();
  renderPhases();
}

document.getElementById("addPhase").addEventListener("click", addPhase);

// Auto scroll helper function
function autoScroll() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
}

// Runs a single timer using a timestamp to calculate elapsed time.
// When a Work timer is running, the background becomes green.
// When a Rest timer is running, the background becomes yellow.
// When the timer completes, the background reverts to the default (#f4f4f4).
function runTimer(timer, displayElement) {
  return new Promise((resolve) => {
    const totalDuration = timer.minutes * 60 + timer.seconds; // in seconds
    const startTime = Date.now();
    displayElement.style.color = "black";
    const emoji = timer.type === "Work" ? "🚴‍♂️" : "🛌";

    // Set background color based on timer type:
    if (timer.type === "Work") {
      document.body.style.backgroundColor = "#ffc433"; // yellow
    } else {
      document.body.style.backgroundColor = "#33daff"; // light blue
    }

    function updateDisplay() {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(totalDuration - elapsed, 0);
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      displayElement.textContent = `${emoji} - ${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}`;
      autoScroll();
      if (remaining <= 0) {
        displayElement.style.color = "green";
        clearInterval(timerInterval);
        // Reset background to default when timer completes.
        document.body.style.backgroundColor = "#f4f4f4";
        resolve();
      }
    }

    // Update immediately and then every second.
    updateDisplay();
    const timerInterval = setInterval(updateDisplay, 1000);
  });
}

// Runs all phases sequentially.
async function startPhases() {
  running = true;
  if (wakeLockEnabled) await requestWakeLock();

  // Hide setup UI and show running display.
  document.getElementById("phasesContainer").style.display = "none";
  const runningDisplay = document.getElementById("runningDisplay");
  runningDisplay.style.display = "block";
  runningDisplay.innerHTML = ""; // Clear previous content

  // Iterate through phases.
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
    const phase = phases[phaseIndex];

    // Phase header.
    const phaseHeader = document.createElement("h2");
    phaseHeader.textContent = `Phase ${phaseIndex + 1}`;
    runningDisplay.appendChild(phaseHeader);
    autoScroll();

    // Run each repetition.
    for (let rep = 0; rep < phase.repeat; rep++) {
      const repHeader = document.createElement("h3");
      repHeader.textContent = `Repetition ${rep + 1} of ${phase.repeat}`;
      runningDisplay.appendChild(repHeader);
      autoScroll();

      // Container for timers in this repetition.
      const timersContainer = document.createElement("div");
      timersContainer.className = "timersContainer";
      runningDisplay.appendChild(timersContainer);
      autoScroll();

      // Run each timer sequentially.
      for (
        let timerIndex = 0;
        timerIndex < phase.timers.length;
        timerIndex++
      ) {
        const timer = phase.timers[timerIndex];
        const timerDiv = document.createElement("div");
        timerDiv.className = "timer";
        const emoji = timer.type === "Work" ? "🚴‍♂️" : "🛌";
        timerDiv.textContent = `${emoji} - ${String(
          timer.minutes
        ).padStart(2, "0")}:${String(timer.seconds).padStart(2, "0")}`;
        timersContainer.appendChild(timerDiv);
        autoScroll();
        await runTimer({ ...timer }, timerDiv);
      }
    }
  }

  runningDisplay.innerHTML += "<h2>All phases completed!</h2>";

  // Add a button to go back to the setup view.
  const backButton = document.createElement("button");
  backButton.textContent = "BtS";
  backButton.addEventListener("click", function () {
    document.getElementById("phasesContainer").style.display = "block";
    document.getElementById("runningDisplay").style.display = "none";
    renderPhases(); // Re-render the setup view if needed.
  });
  runningDisplay.appendChild(backButton);

  autoScroll();
  releaseWakeLock();
  running = false;
}

document.getElementById("start").addEventListener("click", startPhases);

// Stop & Reset functions
function stopTimers() {
  running = false;
  if (currentTimerInterval) {
    clearInterval(currentTimerInterval);
  }
  releaseWakeLock();
}

document.getElementById("stop").addEventListener("click", stopTimers);

function resetAll() {
  stopTimers();
  phases = [];
  savePhases();
  document.getElementById("phasesContainer").innerHTML = "";
  document.getElementById("phasesContainer").style.display = "block";
  document.getElementById("runningDisplay").style.display = "none";
}

document.getElementById("reset").addEventListener("click", resetAll);

// "BtS" button functionality
document
  .getElementById("backToSetup")
  .addEventListener("click", function () {
    document.getElementById("runningDisplay").style.display = "none";
    document.getElementById("phasesContainer").style.display = "block";
    renderPhases();
  });

// Load stored phases on page load.
window.addEventListener("DOMContentLoaded", loadPhases);