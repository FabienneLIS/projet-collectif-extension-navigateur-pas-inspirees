const settings = {
    pomodoro: 1,
    shortBreak: 5,
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
                                remainingTime: settings["longBreak"]*60
                            });
                        } else {
                            chrome.storage.local.set({
                                mode: "shortBreak",
                                remainingTime: settings["shortBreak"]*60
                            });
                        }
                        break;
                    default:
                        chrome.storage.local.set({
                            mode: "pomodoro",
                            remainingTime: settings["pomodoro"]*60
                        });
                }
            }
            
        }
        if (res.remainingTime <= 0) {
            if (Notification.permission === "granted") {
                const text = res.mode === "pomodoro" ? "Get back to work!" : "Take a break!";
                new Notification(text);
            }
        }
    });
}, 1000);
