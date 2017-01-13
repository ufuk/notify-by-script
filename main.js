// Create alarm
// Documentation for "chrome.alarms": https://developer.chrome.com/extensions/alarms
function createAlarm() {
    getAlarmOptions(function (options) {
        chrome.alarms.clearAll(function () {
            console.log("Alarms cleared.");

            if (options && options.activated) {
                chrome.alarms.create("notify-by-script-condition", {periodInMinutes: options.period});
                console.log("Alarms created.");
            }
        });
    });
}
createAlarm();

// Configure what will happened when alarm triggered
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("Alarm triggered: " + alarm.name);

    getAlarmOptions(function (options) {
        if (options && options.activated) {
            var result = eval(options.script);

            if (result != undefined) {
                notify(alarm.name, result.title, result.message);
            }
        }
    });
});

// Documentation for "chrome.notifications": https://developer.chrome.com/extensions/notifications
function notify(alarmName, title, message) {
    chrome.notifications.getAll(function (notifications) {
        console.log("Current notification ids: " + JSON.stringify(notifications));

        var notificationIds = Object.keys(notifications);
        for (var i = 0; i < notificationIds.length; i++) {
            var eachNotificationId = notificationIds[i];
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

        var notificationId = alarmName + "-" + new Date().getTime();
        chrome.notifications.create(notificationId, {
            "type": "basic",
            "title": title,
            "iconUrl": "https://raw.githubusercontent.com/ufuk/notify-by-script-condition/master/icon.png",
            "message": message
        }, function () {
            console.log("Notification created: " + notificationId);
        });
    });
}

// New options listener
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Message received: " + request.message);

        if (request.message == "newOptionsSaved") {
            createAlarm();
            sendResponse({message: "alarmsReCreated"});
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