let isSandboxReady = false;
const messageQueue = [];

function sendToSandbox(payload) {
    const frame = document.getElementById("theFrame");
    if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(payload, '*');
    }
}

window.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'sandboxReady') {
        isSandboxReady = true;
        while (messageQueue.length > 0) {
            const queued = messageQueue.shift();
            sendToSandbox(queued);
        }
        return;
    }

    if (event.data.type === 'sandboxResult') {
        chrome.runtime.sendMessage({
            type: "evaluation-result",
            data: event.data
        });
    } else if (event.data.type === 'sandboxError') {
        console.warn("Sandbox evaluation error:", event.data);
        chrome.runtime.sendMessage({
            type: "evaluation-error",
            data: event.data
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "evaluate") {
        const payload = {
            action: 'eval',
            alarmName: request.alarmName,
            script: request.alarmOptions?.script || '',
            executionId: request.executionId || Date.now()
        };

        if (isSandboxReady) {
            sendToSandbox(payload);
        } else {
            messageQueue.push(payload);
            // Attempt to ping sandbox if ready event was missed
            sendToSandbox({action: 'ping'});
        }
        sendResponse({status: "queued"});
        return true;
    }
});