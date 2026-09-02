/**
 * Notify by Script - Background Service Worker
 */

const DEFAULT_OPTIONS = {
    period: 5,
    script: '',
    activated: false
};

// Open options page on initial installation
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        console.log("Notify by Script installed for the first time. Opening options page.");
        try {
            await chrome.runtime.openOptionsPage();
        } catch (err) {
            console.error("Failed to open options page:", err);
        }
    }
    await syncAlarms();
});

// Sync and setup alarms based on user configuration
async function syncAlarms() {
    try {
        const options = await getAlarmOptions();
        await chrome.alarms.clearAll();
        console.log("Existing alarms cleared.");

        if (options && options.activated) {
            const period = Math.max(1, Number(options.period) || 5);
            chrome.alarms.create("notify-by-script", {periodInMinutes: period});
            console.log(`Alarm scheduled every ${period} minute(s).`);
        }
    } catch (err) {
        console.error("Failed to sync alarms:", err);
    }
}

// Ensure alarms are configured on startup
syncAlarms();

// Alarm trigger handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log("Alarm triggered:", alarm.name);
    await executeAlarm(alarm.name);
});

// Display Chrome notification
async function notify(alarmName, title, message) {
    try {
        const notifications = await chrome.notifications.getAll();
        const notificationIds = Object.keys(notifications || {});

        for (const eachId of notificationIds) {
            if (eachId.startsWith(alarmName)) {
                await chrome.notifications.clear(eachId);
            }
        }

        const notificationId = `${alarmName}-${Date.now()}`;
        const finalTitle = String(title ?? "Notify by Script");
        const finalMessage = String(message ?? "");

        await chrome.notifications.create(notificationId, {
            type: "basic",
            title: finalTitle,
            iconUrl: chrome.runtime.getURL("icon-128.png"),
            message: finalMessage,
            priority: 2
        });

        console.log("Notification created:", notificationId);
    } catch (err) {
        console.error("Failed to create notification:", err);
    }
}

// Fetch stored options from chrome.storage.sync
async function getAlarmOptions() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(DEFAULT_OPTIONS, (options) => {
            resolve(options || DEFAULT_OPTIONS);
        });
    });
}

// Offscreen document management
async function ensureOffscreen() {
    if (await chrome.offscreen.hasDocument()) {
        return;
    }

    try {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['IFRAME_SCRIPTING'],
            justification: 'Evaluation of the custom script provided by the user using a sandboxed iframe'
        });
        console.log("Offscreen document created successfully.");
    } catch (err) {
        if (!err.message?.includes('Only a single offscreen document')) {
            console.error("Failed to create offscreen document:", err);
            throw err;
        }
    }
}

// Execute user script in offscreen sandbox
async function executeAlarmWithOptions(alarmOptions, alarmName, executionId) {
    if (!alarmOptions || !alarmOptions.script) {
        console.log("No script configured to execute.");
        return;
    }

    await ensureOffscreen();

    chrome.runtime.sendMessage({
        type: "evaluate",
        alarmName,
        alarmOptions,
        executionId: executionId || Date.now()
    }).catch((err) => {
        console.warn("Could not dispatch evaluate message directly (offscreen might still be initializing):", err);
    });
}

// Execute alarm by reading current options
async function executeAlarm(alarmName) {
    const options = await getAlarmOptions();
    if (options.activated) {
        await executeAlarmWithOptions(options, alarmName);
    }
}

// Handle messages from options page and offscreen worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "newOptionsSaved") {
        syncAlarms().then(() => {
            sendResponse({message: "alarmsReCreated"});
        });
        return true;
    }

    if (request.message === "testScript") {
        executeAlarmWithOptions(request.alarmOptions, "test-script", request.executionId)
            .then(() => {
                sendResponse({message: "scriptEvaluationStarted"});
            })
            .catch((err) => {
                sendResponse({error: err.message});
            });
        return true;
    }

    if (request.type === "evaluation-result") {
        const {result, alarmName} = request.data || {};
        console.log("Evaluation result received for:", alarmName, result);

        if (result && typeof result === "object") {
            const {title, message} = result;
            if (title !== undefined || message !== undefined) {
                notify(alarmName, title || "Notification", message || "");
            }
        }
        return false;
    }

    if (request.type === "evaluation-error") {
        console.warn("Evaluation error received for:", request.data);
        return false;
    }
});

// Extension Action (Toolbar icon) click handler
chrome.action.onClicked.addListener(async () => {
    console.log("Toolbar action clicked.");
    const options = await getAlarmOptions();
    await executeAlarmWithOptions(options, "run-with-browser-action");
});
