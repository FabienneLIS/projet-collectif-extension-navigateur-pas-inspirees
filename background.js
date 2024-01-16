const settings = {
    pomodoro: 0.2,
    shortBreak: 0.2,
    longBreak: 0.2,
    longBreakInterval: 4,
    sessions: 0,
};

// vérifie si les valeurs sont présentes et initie celles qui ne le sont pas
chrome.storage.local.get(["isRunning", "longBreakInterval", "sessions", "mode", "remainingTime", "click", "totalwater"], (res) => {
    chrome.storage.local.set({
        isRunning: "isRunning" in res ? res.isRunning : false,
        longBreakInterval: "longBreakInterval" in res ? res.longBreakInterval : 4,
        mode: "mode" in res ? res.mode : "pomodoro",
        remainingTime: "remainingTime" in res ? res.remainingTime : 25 * 60,
        sessions: "sessions" in res ? res.sessions : 1,
        click: 1,
        totalwater: 50,
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

// pendant l'intervale d'une seconde, si le chrono est lancé, diminuer de 1 seconde et gère le changement de mode quand 0 atteint
interval = setInterval(function () {
    chrome.storage.local.get(["isRunning", "longBreakInterval", "sessions", "mode", "remainingTime"], (res) => {
        if (res.isRunning) {
            chrome.storage.local.set({
                remainingTime: res.remainingTime - 1,
            });
            console.log("normal");
            if (res.remainingTime <= 0) {
                switch (res.mode) {
                    case "pomodoro":
                        if (res.sessions === 4) {
                            chrome.storage.local.set({
                                mode: "longBreak",
                                remainingTime: settings["longBreak"] * 60,
                                sessions: 0,
                            });
                            console.log("longbreak");
                            createAlarm();
                        } else {
                            chrome.storage.local.set({
                                mode: "shortBreak",
                                remainingTime: settings["shortBreak"] * 60,
                            });
                            console.log("shortbreak");
                            createAlarm();
                        }
                        break;
                    default:
                        chrome.storage.local.set({
                            mode: "pomodoro",
                            remainingTime: settings["pomodoro"] * 60,
                            sessions: res.sessions + 1,
                        });
                        console.log("pomodoro");
                        createAlarm();
                        break;
                }
            }
        }
    });
}, 1000);

// alarms

chrome.alarms.onAlarm.addListener(() => {
    //  créer l'alarme sur le pc
    chrome.notifications.create(
        {
            type: "basic",
            iconUrl: "img/lhorloge.png",
            title: "Time's up !",
            message: "Your time is over, skipping to the next mode \nAnd don't forget to drink !",
            silent: false,
        },
        () => {}
    );
    stopAlarm();
});

// récupère le message que le main lui a envoyé et active la création du message
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.btn === "start") {
        createAlarm();
    }
    if (request.btn === "stop") {
        stopAlarm();
    }
    if (request.btn === "waterstart") {
        updateWater();
    }
});

// créé l'alarme toutes les tant de minutes
function createAlarm() {
    chrome.storage.local.get(["remainingTime"], (res) => {
        chrome.alarms.create("timesup", {
            periodInMinutes: res.remainingTime / 60,
        });
    });
}

function stopAlarm() {
    chrome.alarms.clear("timesup");
}

function updateWater() {
    console.log("bg");
    chrome.storage.local.get(["click", "totalWater"], (res) => {
        console.log(res.totalWater);
        switch (true) {
            case res.click >= 0 && res.click <= 7:
                chrome.storage.local.set({
                    click: res.click + 1,
                    totalWater: res.totalWater - 5,
                });

                break;
            case res.click === 8:
                chrome.storage.local.set({
                    click: res.click + 1,
                    totalWater: 45,
                });

                break;
            case res.click > 8:
                chrome.storage.local.set({
                    click: 0,
                    totalWater: 45,
                });

                break;
            default:
                break;
        }
    });
}
