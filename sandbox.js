window.addEventListener('message', async (event) => {
    const {action, script, alarmName, executionId} = event.data || {};

    if (action === 'ping') {
        event.source.postMessage({type: 'sandboxReady'}, '*');
        return;
    }

    if (action === 'eval') {
        try {
            const rawResult = eval(script);
            const result = await Promise.resolve(rawResult);
            event.source.postMessage({
                type: 'sandboxResult',
                result: result ?? null,
                alarmName,
                executionId
            }, '*');
        } catch (error) {
            event.source.postMessage({
                type: 'sandboxError',
                error: error?.message || String(error),
                stack: error?.stack || null,
                alarmName,
                executionId
            }, '*');
        }
    }
});

// Notify parent frame that sandbox is loaded and ready
try {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({type: 'sandboxReady'}, '*');
    }
} catch (e) {
    // Ignore any cross-origin notification issues
}