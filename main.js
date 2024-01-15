const settings = {
    pomodoro: 0.2,
    shortBreak: 0.2,
    longBreak: 0.3,
    longBreakInterval: 4,
    sessions: 0,
};

// fait commencer une intervalle pour update la pop up
let updateInterval = setInterval(function () {
    chrome.storage.local.get(["isRunning", "mode"], (res) => {
        if (res.isRunning) {
            updateClock();
        }
        updateModeVisual(res.mode);
    });
}, 100);

// gère le start et stop + changement icônes en fonction du mode
const mainButton = document.getElementById("js-btn");
mainButton.addEventListener("click", () => {
    const { action } = mainButton.dataset;
    if (action === "start") {
        startTimer();
        chrome.runtime.sendMessage({ btn: "start" }, function (response) {});
    } else {
        stopTimer();
        chrome.runtime.sendMessage({ btn: "stop" }, function (response) {});
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

        const progress = document.getElementById("js-progress"); // gère barre de progression
        progress.value = settings[res.mode] * 60 - res.remainingTime;
    });
}

function updateModeVisual(mode) {
    document.querySelectorAll("button[data-mode]").forEach((e) => e.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
    document.body.style.backgroundColor = `var(--${mode})`;
    document.getElementById("js-progress").setAttribute("max", settings[mode] * 60); // gère l'ésthétique modes
    chrome.storage.local.get(["isRunning"], (res) => {
        if (res.isRunning) {
            switch (mode) {
                case "pomodoro":
                    chrome.action.setIcon({ path: "img/icon-pomodoro-working.png" });
                    break;
                case "longBreak":
                    chrome.action.setIcon({ path: "img/icon-pomodoro-long-break.png" });
                    break;
                case "shortBreak":
                    chrome.action.setIcon({ path: "img/icon-pomodoro-short-break.png" });
                    break;
                default:
                    chrome.action.setIcon({ path: "img/icon-pomodoro.png" });
                    break;
            }
        } else {
            chrome.action.setIcon({ path: "img/icon-pomodoro.png" });
        }
    });
}

// gère le changement de mode
function switchMode(mode) {
    chrome.storage.local.set({
        mode, // change le mode
        remainingTime: settings[mode] * 60, // change le remainingTime au temps du mode en secondes
    });
    updateModeVisual(mode);

    updateClock();
}

// récupère la data du HTML en fonction clic bouton et change de mode
function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

// quand le DOM est chargé, lance 2 fonctions
document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    initDom();
});

function initDom() {
    chrome.storage.local.get(["isRunning", "mode"], (res) => {
        updateModeVisual(res.mode);
        if (res.isRunning) {
            startTimer();
        } else {
            stopTimer();
        }
    });
}

//water
// Sélectionnez le bouton d'eau
const button = document.querySelector(".glassofwater");

// Initialisez le compteur de clics
let click = 0;

// Ajoutez un écouteur d'événements au clic sur le bouton
button.addEventListener("click", event => {
    // Incrémentez le compteur de clics
    click = 1;
    const waterbottle = document.querySelector(".waterBottle")
for (let i=5;i<40;i+5){
    waterbottle.style.marginTop= `${i}px`
    // Affichez le nombre de clics dans la console
    console.log("Nombre de clics :", click++);
    }
})


// const waterbottle = document.querySelector(".waterBottle")

()