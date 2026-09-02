// ==========================================
// Notify by Script - Example Scripts
// ==========================================

// 1. Simple Hello World
(function () {
    return {
        title: "Hello World",
        message: "Notify by Script is here to allow you setting alarms with custom notifications."
    };
})();


// 2. Health check of your website or API (Modern async/fetch)
(async function () {
    try {
        const response = await fetch("https://your-website.com/api/health");
        return {
            title: "Health Check",
            message: "Status: " + response.status + " (" + response.statusText + ")"
        };
    } catch (err) {
        return {
            title: "Health Check Alert!",
            message: "Service unreachable: " + err.message
        };
    }
})();


// 3. Conditional Notification (Only notifies when an issue is detected)
(async function () {
    try {
        const response = await fetch("https://your-website.com");
        if (response.status !== 200) {
            return {
                title: "Website Alert",
                message: "Unexpected status code: " + response.status
            };
        }
    } catch (err) {
        return {
            title: "Website Down Alert",
            message: "Failed to connect: " + err.message
        };
    }
    // Returning undefined/null skips the notification
})();


// 4. Crypto / Currency Price Check (CoinGecko API)
(async function () {
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
        const data = await res.json();
        const btc = data?.bitcoin?.usd?.toLocaleString();
        const eth = data?.ethereum?.usd?.toLocaleString();
        return {
            title: "Crypto Market Update",
            message: `BTC: $${btc} | ETH: $${eth}`
        };
    } catch (err) {
        return {
            title: "Crypto Tracker Error",
            message: err.message
        };
    }
})();


// 5. Periodic Hydration / Posture Reminder
(function () {
    const reminders = [
        "Time for a cup of fresh water! 💧",
        "Roll your shoulders and drink some water! 🧘",
        "Stay energized, take a water break! 🥤"
    ];
    return {
        title: "Health Reminder",
        message: reminders[Math.floor(Math.random() * reminders.length)]
    };
})();
