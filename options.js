// Defaults
const DEFAULT_SCRIPT =
    "(function () {\n" +
    "    return {\n" +
    "        title: 'Hello World',\n" +
    "        message: 'Notify by Script is here to allow you setting alarms with custom notifications.'\n" +
    "    };\n" +
    "})()";

// Saves options to chrome.storage.
function saveOptions() {
    const newOptions = extractOptionsFromInputs();

    console.log("Options saving: ");
    console.log(newOptions);

    chrome.storage.sync.set(newOptions, function () {
        // Saved
        const statusText = 'Options saved.';
        console.log(statusText);

        // Show 'saved' message
        displayStatus(statusText);

        // Send message to refresh alarm
        chrome.runtime.sendMessage({ message: "newOptionsSaved" }, function (response) {
            console.log(response.message);
        });
    });
}

// Restores settings using the stored data in chrome.storage.
function restoreOptions() {
    const $period = periodInput();
    const $script = scriptInput();
    const $activated = activatedInput();

    console.log("Options restoring...");
    chrome.storage.sync.get({
        period: 5,
        script: DEFAULT_SCRIPT,
        activated: false
    }, function (options) {
        $period.val(options.period);
        $script.val(options.script);
        $activated.prop('checked', options.activated);

        console.log("Options restored: ");
        console.log(options);
    });
}

function testScript() {
    // Send message to test alarm options
    const alarmOptions = extractOptionsFromInputs();
    alarmOptions.activated = true;
    chrome.runtime.sendMessage({
        message: "testScript",
        alarmOptions: alarmOptions
    }, function (response) {
        if (response && response.message) {
            console.log(response.message);
            displayStatus("Script evaluated.");
        }
    });
}

// Helper methods
function periodInput() {
    return $('input[name="period"]');
}

function scriptInput() {
    return $('textarea[name="script"]');
}

function activatedInput() {
    return $('input[name="activated"]');
}

function extractOptionsFromInputs() {
    const $period = periodInput();
    const $script = scriptInput();
    const $activated = activatedInput();

    return {
        period: parseInt($period.val()),
        script: $script.val(),
        activated: $activated.prop('checked')
    };
}

function displayStatus(statusText) {
    const $statusLabel = $('#statusLabel');
    $statusLabel.text(statusText);
    setTimeout(function () {
        $statusLabel.text('');
    }, 750);
}

// Set event bindings
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('testScript').addEventListener('click', testScript);
document.getElementById('editor').addEventListener('keydown', onEditorKeyDown);

function onEditorKeyDown(event) {
    if (event.keyCode === 9) {
        event.preventDefault();
        const v = this.value;
        const s = this.selectionStart;
        const e = this.selectionEnd;
        this.value = v.substring(0, s) + '    ' + v.substring(e);
        this.selectionStart = this.selectionEnd = s + 4;
    }
}
