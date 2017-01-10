// Create alarm
// Documentation for "chrome.alarms": https://developer.chrome.com/extensions/alarms
function createAlarm() {
    getAlarmOptions(function (options) {
        if (options && options.activated) {
            chrome.alarms.create("notify-by-script-condition", {periodInMinutes: options.period});
        }
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
                notify(result.title, result.message);
            }
        }
    });
});

// Documentation for "chrome.notifications": https://developer.chrome.com/extensions/notifications
function notify(title, message) {
    chrome.notifications.create("notify-by-script-condition", {
        "type": "basic",
        "title": title,
        "iconUrl": "https://raw.githubusercontent.com/ufuk/notify-by-script-condition/master/icon.png",
        "message": message
    });
}

// New options listener
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender);

        if (request.message == "newOptionsSaved") {
            createAlarm();
            sendResponse({message: "alarmsReCreated"});
        }
    }
);

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