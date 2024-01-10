const settings = {
    pomodoro: 1,
    shortBreak: 1,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};

// vérifie si les valeurs sont présentes et initie celles qui ne le sont pas
chrome.storage.local.get(["isRunning", "longBreakInterval", "sessions", "mode", "remainingTime"], (res) => {
    chrome.storage.local.set({
        isRunning: "isRunning" in res ? res.isRunning : false,
        longBreakInterval: "longBreakInterval" in res ? res.longBreakInterval : 4,
        mode: "mode" in res ? res.mode : "pomodoro",
        remainingTime: "remainingTime" in res ? res.remainingTime : 25 * 60,
    });
});

// calcul du temps qu'il reste pour atteindre 0
function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}

// penadnt l'intervale d'une seconde, si le chrono est lancé, diminuer de 1 seconde et gère le changement de mode quand 0 atteint
interval = setInterval(function () {
    chrome.storage.local.get(["isRunning", "longBreakInterval", "sessions", "mode", "remainingTime"], (res) => {
        if (res.isRunning) {
            chrome.storage.local.set({
                remainingTime: res.remainingTime - 1,
            });
            if (res.remainingTime <= 0) {
                switch (res.mode) {
                    case "pomodoro":
                        if (res.sessions % res.longBreakInterval === 0) {
                            chrome.storage.local.set({
                                mode: "longBreak",
                                remainingTime: settings["longBreak"] * 60,
                            });
                        } else {
                            chrome.storage.local.set({
                                mode: "shortBreak",
                                remainingTime: settings["shortBreak"] * 60,
                            });
                        }
                        break;
                    default:
                        chrome.storage.local.set({
                            mode: "pomodoro",
                            remainingTime: settings["pomodoro"] * 60,
                        });
                }
            }
        }
    });
}, 1000);



// alarms

chrome.alarms.onAlarm.addListener(() => {//  créer l'alarme sur le pc
    chrome.notifications.create(
        {
            type: "basic",
            iconUrl: "img/lhorloge.png",
            title: "Time's up !",
            message: "Your time is over, skipping to the next mode",
            silent: false,
        },
        () => {}
    );
});

// récupère le message que le main lui a envoyé et active la création du message
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { 
    if (request.time) {
        createAlarm();
    }
});

// créé l'alarme toutes les tant de minutes
function createAlarm() {
    chrome.storage.local.get(["mode"], (res) => {
        chrome.alarms.create("timesup", {
            periodInMinutes: settings[res.mode],
        });
    });
}
