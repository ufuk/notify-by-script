// Saves options to chrome.storage.
function saveOptions() {
    var newOptions = extractOptionsFromInputs();

    console.log("Options saving: ");
    console.log(newOptions);

    chrome.storage.sync.set(newOptions, function () {
        // Saved
        var statusText = 'Options saved.';
        console.log(statusText);

        // Show 'saved' message
        displayStatus(statusText);

        // Send message to refresh alarm
        chrome.runtime.sendMessage({message: "newOptionsSaved"}, function (response) {
            console.log(response.message);
        });
    });
}

// Restores settings using the stored data in chrome.storage.
function restoreOptions() {
    var $period = periodInput();
    var $script = scriptInput();
    var $activated = activatedInput();

    console.log("Options restoring...");
    chrome.storage.sync.get({
        period: 5,
        script: '',
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
    var alarmOptions = extractOptionsFromInputs();
    alarmOptions.activated = true;
    chrome.runtime.sendMessage({
        message: "testScript",
        alarmOptions: alarmOptions
    }, function (response) {
        console.log(response.message);
        displayStatus("Script evaluated.");
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
    var $period = periodInput();
    var $script = scriptInput();
    var $activated = activatedInput();

    return {
        period: parseInt($period.val()),
        script: $script.val(),
        activated: $activated.prop('checked')
    };
}

function displayStatus(statusText) {
    var $statusLabel = $('#statusLabel');
    $statusLabel.text(statusText);
    setTimeout(function () {
        $statusLabel.text('');
    }, 750);
}

// Set event bindings
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('testScript').addEventListener('click', testScript);
