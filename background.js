// When extension installed, open options page at once
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");

    chrome.runtime.openOptionsPage(function () {
        console.log("Options page opened.");
    });
});

// Create alarm
// Documentation for "chrome.alarms": https://developer.chrome.com/extensions/alarms
function createAlarm() {
    getAlarmOptions(function (options) {
        chrome.alarms.clearAll(function () {
            console.log("Alarms cleared.");

            if (options && options.activated) {
                chrome.alarms.create("notify-by-script", { periodInMinutes: options.period });
                console.log("Alarms created.");
            }
        });
    });
}

createAlarm();

// Configure what will happened when alarm triggered
chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("Alarm triggered: " + alarm.name);

    executeAlarm(alarm.name);
});

// Documentation for "chrome.notifications": https://developer.chrome.com/extensions/notifications
function notify(alarmName, title, message) {
    chrome.notifications.getAll(function (notifications) {
        console.log("Current notification ids: " + JSON.stringify(notifications));

        const notificationIds = Object.keys(notifications);
        for (let i = 0; i < notificationIds.length; i++) {
            const eachNotificationId = notificationIds[i];
            if (eachNotificationId.startsWith(alarmName)) {
                console.log("Notification already exists: " + eachNotificationId);
                chrome.notifications.clear(eachNotificationId, function (wasCleared) {
                    if (wasCleared) {
                        console.log("Notification cleared: " + eachNotificationId);
                    } else {
                        console.log("Notification couldn't be cleared: " + eachNotificationId);
                    }
                });
            }
        }

        const notificationId = alarmName + "-" + new Date().getTime();
        chrome.notifications.create(notificationId, {
            "type": "basic",
            "title": title,
            "iconUrl": chrome.runtime.getURL("icon.png"),
            "message": message
        }, function () {
            console.log("Notification created: " + notificationId);
        });
    });
}

// Options page messages listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received: " + request.message);

    if (request.message === "newOptionsSaved") {
        createAlarm();
        sendResponse({ message: "alarmsReCreated" });
    } else if (request.message === "testScript") {
        executeAlarmWithOptions(request.alarmOptions, "test-script");
        sendResponse({ message: "scriptEvaluated" });
    }
}
);

// Get alarm options from Chrome Storage API
function getAlarmOptions(callback) {
    console.log("Getting options...");
    chrome.storage.sync.get({
        period: 5,
        script: '',
        activated: false
    }, function (options) {
        callback(options);
    });
}

// Get alarm options, evaluate and notify
function executeAlarm(alarmName) {
    getAlarmOptions(function (options) {
        executeAlarmWithOptions(options, alarmName);
    });
}

async function ensureOffscreen() {
    if (await chrome.offscreen.hasDocument()) {
        console.log("Offscreen document already exists.");
        return;
    }

    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['IFRAME_SCRIPTING'],
        justification: 'evaluation of the script provided by the user itself',
    });
}

async function executeAlarmWithOptions(alarmOptions, alarmName) {
    await ensureOffscreen();

    if (alarmOptions && alarmOptions.script) {
        chrome.runtime.sendMessage({ type: "evaluate", alarmName, alarmOptions: alarmOptions });
    }
}

// Evaluation result message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type !== "evaluation-result") {
        return;
    }

    if (request.data && request.data.result) {
        notify(request.data.alarmName, request.data.result.title, request.data.result.message);
    }
}
);

// Execute alarm when browser action clicked
chrome.action.onClicked.addListener((tab) => {
    console.log("Browser action clicked.");

    getAlarmOptions(function (options) {
        options.activated = true;
        executeAlarmWithOptions(options, "run-with-browser-action");
    });
});
