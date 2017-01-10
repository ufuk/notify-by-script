// Saves options to chrome.storage.
function saveOptions() {
    var $period = periodInput();
    var $script = scriptInput();
    var $activated = activatedInput();

    var newOptions = {
        period: parseInt($period.val()),
        script: $script.val(),
        activated: $activated.prop('checked')
    };

    console.log("Options saving: ");
    console.log(newOptions);

    chrome.storage.sync.set(newOptions, function () {
        // Saved
        console.log("Options saved.");

        // Show 'saved' message
        var $statusLabel = $('#saveStatusLabel');
        $statusLabel.text('Options saved.');
        setTimeout(function () {
            $statusLabel.text('');
        }, 750);

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

// Set event bindings
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

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