const settings = {
    pomodoro: 1,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};

// fait commencer une intervalle pour update la pop up
let updateInterval = setInterval(function () {
    chrome.storage.local.get(["isRunning", "mode"], (res) => {
        if (res.isRunning) {
            updateClock();
        }
        updateModeVisual(res.mode)
    });
}, 1000);

// gère le start et stop + changement icônes en fonction du mode
const mainButton = document.getElementById("js-btn");
mainButton.addEventListener("click", () => {
    const { action } = mainButton.dataset;
    if (action === "start") {
        startTimer();
        chrome.storage.local.get(["mode"], (res) => {
            if (res.mode === "pomodoro") {
                chrome.action.setIcon({ path: "img/icon-pomodoro-working.png" });
            } else if (res.mode === "shortBreak") {
                chrome.action.setIcon({ path: "img/icon-pomodoro-short-break.png" });
            } else if (res.mode === "longBreak") {
                chrome.action.setIcon({ path: "img/icon-pomodoro-long-break.png" });
            }
        });
    } else {
        stopTimer();
        chrome.action.setIcon({ path: "img/icon-pomodoro.png" });
    }
});

// changer les modes en fonctions des boutons
const modeButtons = document.querySelector("#js-mode-buttons");
modeButtons.addEventListener("click", handleMode);

/// démarre le chrono pour le stocker dans bg et incrémenter sessions et changer bouton start stop
function startTimer() {
    chrome.storage.local.set({
        isRunning: true, // indique au bg que le timer est en route
    });
    chrome.storage.local.get(["mode"], (res) => {
        if (res.mode === "pomodoro") {
            chrome.storage.local.set({
                sessions: res.sessions + 1, // stocke l'incrémentation des sessions dans bg
            });
        }
        mainButton.dataset.action = "stop";
        mainButton.textContent = "stop";
        mainButton.classList.add("active");
    });
}

// arrête le chrono et gere le bouton start stop
function stopTimer() {
    chrome.storage.local.set({
        isRunning: false, // indique au bg que le timer a stoppé
    });

    mainButton.dataset.action = "start";
    mainButton.textContent = "start";
    mainButton.classList.remove("active");
}

// met à jour les chiffres dans la pop up
function updateClock() {
    chrome.storage.local.get(["remainingTime", "mode"], (res) => {
        const minutes = `${Number.parseInt((res.remainingTime / 60) % 60, 10)}`.padStart(2, "0"); // affichage a deux chiffres
        const seconds = `${Number.parseInt(res.remainingTime % 60, 10)}`.padStart(2, "0");
        const min = document.getElementById("js-minutes");
        const sec = document.getElementById("js-seconds");
        min.textContent = minutes;
        sec.textContent = seconds;

        const text = res.mode === "pomodoro" ? "Get back to work!" : "Take a break!";
        document.title = `${minutes}:${seconds} — ${text}`; // change nom onglet

        const progress = document.getElementById("js-progress"); // gère barre de progression
        progress.value = settings[res.mode] * 60 - res.remainingTime;
    });
}

function updateModeVisual(mode) {
    document.querySelectorAll("button[data-mode]").forEach((e) => e.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
    document.body.style.backgroundColor = `var(--${mode})`;
    document.getElementById("js-progress").setAttribute("max", settings[mode] * 60); // gère l'ésthétique modes
}

// gère le changement de mode
function switchMode(mode) {
    chrome.storage.local.set({
        mode, // change le mode
        remainingTime: settings[mode] * 60, // change le remainingTime au temps du mode en secondes
    });
    updateModeVisual(mode)

    updateClock();
}

// récupère la data du HTML en fonction clic bouton et change de mode
function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

// gère les autorisations
document.addEventListener("DOMContentLoaded", () => {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    new Notification("Awesome! You will be notified at the start of each session");
                }
            });
        }
    }
    updateClock();
    initDom();
});

function initDom() {
    chrome.storage.local.get(["isRunning", "mode"], (res) => {
        updateModeVisual(res.mode)
        if (res.isRunning) {
            startTimer();
        } else {
            stopTimer();
        }
    });
}
