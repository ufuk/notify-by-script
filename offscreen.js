window.addEventListener('message', (event) => {
  if (event.data.type === 'sandboxResult') {
    chrome.runtime.sendMessage({ type: "evaluation-result", data: event.data });
  } else if (event.data.type === 'sandboxError') {
    console.log("Sandbox evaluation failed: " + event.data);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type !== "evaluate") {
    return;
  }

  document.getElementById("theFrame").contentWindow.postMessage({ action: 'eval', alarmName: request.alarmName, script: request.alarmOptions.script }, '*');
});