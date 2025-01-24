window.addEventListener('message', (event) => {
    const { action, script, alarmName } = event.data;

    if (action === 'eval') {
        try {
            const result = eval(script);
            event.source.postMessage({ type: 'sandboxResult', result, alarmName }, '*');
        } catch (error) {
            event.source.postMessage({ type: 'sandboxError', error: error.message }, '*');
        }
    }
});