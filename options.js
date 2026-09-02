/**
 * Notify by Script - Options Page Logic
 */

// Default script template
const DEFAULT_SCRIPT = `(function () {
    return {
        title: "Hello World",
        message: "Notify by Script is here to allow you setting alarms with custom notifications."
    };
})();`;

// Built-in script presets with modern async/await and fetch examples
const SCRIPT_PRESETS = {
    helloWorld: `(function () {
    return {
        title: "Hello World",
        message: "Notify by Script is running smoothly!"
    };
})();`,

    healthCheck: `// Check website or API health status using async/await and fetch
(async function () {
    try {
        const response = await fetch("https://httpbin.org/status/200");
        return {
            title: "Website Health Check",
            message: "Service is UP (Status: " + response.status + ")"
        };
    } catch (err) {
        return {
            title: "Website Health ALERT",
            message: "Service is DOWN: " + err.message
        };
    }
})();`,

    crypto: `// Fetch Bitcoin price from CoinGecko Public API
(async function () {
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        const data = await res.json();
        const price = data?.bitcoin?.usd;
        return {
            title: "BTC / USD Price",
            message: "Current Price: $" + (price ? price.toLocaleString() : "N/A")
        };
    } catch (err) {
        return {
            title: "Crypto Tracker Error",
            message: "Could not fetch price: " + err.message
        };
    }
})();`,

    water: `// Simple periodic hydration reminder
(function () {
    const messages = [
        "Time for a quick stretch and a glass of water! 💧",
        "Stay hydrated! Your brain works better with water. 🥤",
        "Take a deep breath and drink some water! 🌊"
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    return {
        title: "Hydration Reminder",
        message: randomMsg
    };
})();`,

    conditional: `// Only trigger notification when a specific condition is met
(async function () {
    const res = await fetch("https://httpbin.org/status/200");
    
    // Return undefined or null to skip showing a notification for this cycle
    if (res.status !== 200) {
        return {
            title: "Warning: Non-200 Status",
            message: "Received status code: " + res.status
        };
    }
    // Returning nothing prevents any notification from displaying
})();`
};

let currentTestingExecutionId = null;
let testTimeoutTimer = null;

// DOM Elements
const elements = {
    periodInput: document.getElementById('periodInput'),
    activatedInput: document.getElementById('activatedInput'),
    editor: document.getElementById('editor'),
    presetSelect: document.getElementById('presetSelect'),
    btnSave: document.getElementById('btnSave'),
    btnTest: document.getElementById('btnTest'),
    btnCopy: document.getElementById('btnCopy'),
    btnReset: document.getElementById('btnReset'),
    statusLabel: document.getElementById('statusLabel'),
    simNotificationContainer: document.getElementById('simNotificationContainer'),
    logConsole: document.getElementById('logConsole')
};

// Apply i18n localization to all elements with data-i18n attributes
function applyLocalization() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const translated = chrome.i18n.getMessage(key);
        if (translated) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = translated;
            } else {
                el.textContent = translated;
            }
        }
    });

    const pageTitle = chrome.i18n.getMessage('optionsTitle');
    if (pageTitle) {
        document.title = pageTitle;
    }
}

// Restore saved settings from chrome.storage.sync
async function restoreOptions() {
    try {
        chrome.storage.sync.get({
            period: 5,
            script: DEFAULT_SCRIPT,
            activated: false
        }, (options) => {
            elements.periodInput.value = options.period || 5;
            elements.editor.value = options.script || DEFAULT_SCRIPT;
            elements.activatedInput.checked = Boolean(options.activated);
        });
    } catch (err) {
        console.error("Failed to restore options:", err);
    }
}

// Save current settings to chrome.storage.sync
function saveOptions() {
    const period = Math.max(1, parseInt(elements.periodInput.value, 10) || 5);
    const script = elements.editor.value.trim() || DEFAULT_SCRIPT;
    const activated = elements.activatedInput.checked;

    const payload = {period, script, activated};

    chrome.storage.sync.set(payload, () => {
        showStatus(chrome.i18n.getMessage("statusSaved") || "Settings saved successfully!", "success");

        chrome.runtime.sendMessage({message: "newOptionsSaved"}, (response) => {
            console.log("Alarms refreshed:", response?.message);
        });
    });
}

// Test current script in sandbox and show simulated notification + logs
function testScript() {
    const script = elements.editor.value.trim();
    if (!script) {
        showStatus("Please enter a valid JavaScript snippet.", "error");
        return;
    }

    currentTestingExecutionId = Date.now();
    showStatus(chrome.i18n.getMessage("statusTesting") || "Evaluating script...", "success");

    elements.logConsole.textContent = `// [${new Date().toLocaleTimeString()}] Executing script in sandboxed environment...\n`;
    elements.simNotificationContainer.innerHTML = `
        <div class="preview-empty" style="color: #38bdf8;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;">
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
            Running script...
        </div>
    `;

    // Timeout safeguard
    if (testTimeoutTimer) clearTimeout(testTimeoutTimer);
    testTimeoutTimer = setTimeout(() => {
        if (currentTestingExecutionId) {
            handleTestError("Execution timed out after 10 seconds. Check network requests or infinite loops in your script.");
        }
    }, 10000);

    const alarmOptions = {
        period: parseInt(elements.periodInput.value, 10) || 5,
        script: script,
        activated: true
    };

    chrome.runtime.sendMessage({
        message: "testScript",
        alarmOptions: alarmOptions,
        executionId: currentTestingExecutionId
    });
}

// Handle successful evaluation result from background/offscreen
function handleTestResult(data) {
    if (testTimeoutTimer) clearTimeout(testTimeoutTimer);
    currentTestingExecutionId = null;

    const {result} = data || {};
    const timestamp = new Date().toLocaleTimeString();

    showStatus(chrome.i18n.getMessage("statusTestSuccess") || "Script evaluated successfully!", "success");

    if (!result || (typeof result !== "object")) {
        elements.simNotificationContainer.innerHTML = `
            <div class="preview-empty">
                ℹ️ ${chrome.i18n.getMessage("statusNoNotification") || "Script returned null/undefined. No notification was generated."}
            </div>
        `;
        elements.logConsole.innerHTML = `<span class="log-success">// [${timestamp}] Returned Value:</span>\n${JSON.stringify(result, null, 2)}`;
        return;
    }

    const title = result.title ?? "Notification";
    const message = result.message ?? "";

    elements.simNotificationContainer.innerHTML = `
        <div class="sim-notification">
            <img src="icon-128.png" alt="Icon" class="sim-icon">
            <div class="sim-content">
                <div class="sim-source">Notify by Script • just now</div>
                <div class="sim-title">${escapeHtml(title)}</div>
                <div class="sim-message">${escapeHtml(message)}</div>
            </div>
        </div>
    `;

    elements.logConsole.innerHTML = `<span class="log-success">// [${timestamp}] Result Object:</span>\n${JSON.stringify(result, null, 2)}`;
}

// Handle evaluation error from background/offscreen
function handleTestError(errorMsg, stack) {
    if (testTimeoutTimer) clearTimeout(testTimeoutTimer);
    currentTestingExecutionId = null;

    const timestamp = new Date().toLocaleTimeString();
    showStatus(chrome.i18n.getMessage("statusTestError") || "Script evaluation failed", "error");

    elements.simNotificationContainer.innerHTML = `
        <div class="preview-empty" style="color: #ef4444;">
            ❌ Script execution threw an error. Inspect the logs below.
        </div>
    `;

    elements.logConsole.innerHTML = `<div class="log-error">// [${timestamp}] Execution Error:\n${escapeHtml(errorMsg)}${stack ? '\n\n' + escapeHtml(stack) : ''}</div>`;
}

// Listen for incoming evaluation result or error messages from offscreen/background
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "evaluation-result") {
        if (request.data?.alarmName === "test-script" || request.data?.executionId === currentTestingExecutionId) {
            handleTestResult(request.data);
        }
    } else if (request.type === "evaluation-error") {
        if (request.data?.alarmName === "test-script" || request.data?.executionId === currentTestingExecutionId) {
            handleTestError(request.data.error, request.data.stack);
        }
    }
});

// Helper: Escape HTML strings for safe rendering
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Display temporary status toast message
function showStatus(text, type = "success") {
    elements.statusLabel.textContent = text;
    elements.statusLabel.className = `status-badge ${type} visible`;

    setTimeout(() => {
        elements.statusLabel.className = `status-badge ${type}`;
        setTimeout(() => {
            elements.statusLabel.textContent = '';
        }, 300);
    }, 3000);
}

// Code editor Tab key indentation handler
function handleEditorKeyDown(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;

        this.value = value.substring(0, start) + '    ' + value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
    }
}

// Preset selection change handler
function handlePresetChange() {
    const selected = elements.presetSelect.value;
    if (selected && SCRIPT_PRESETS[selected]) {
        elements.editor.value = SCRIPT_PRESETS[selected];
        elements.presetSelect.value = "";
        showStatus("Example loaded into editor!", "success");
    }
}

// Copy script button handler
async function handleCopyScript() {
    try {
        await navigator.clipboard.writeText(elements.editor.value);
        showStatus(chrome.i18n.getMessage("copiedToast") || "Copied to clipboard!", "success");
    } catch (err) {
        console.error("Failed to copy:", err);
    }
}

// Reset script button handler
function handleResetScript() {
    if (confirm("Reset script to default template?")) {
        elements.editor.value = DEFAULT_SCRIPT;
        showStatus("Reset to default script.", "success");
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    applyLocalization();
    restoreOptions();

    elements.btnSave.addEventListener('click', saveOptions);
    elements.btnTest.addEventListener('click', testScript);
    elements.btnCopy.addEventListener('click', handleCopyScript);
    elements.btnReset.addEventListener('click', handleResetScript);
    elements.presetSelect.addEventListener('change', handlePresetChange);
    elements.editor.addEventListener('keydown', handleEditorKeyDown);
});
