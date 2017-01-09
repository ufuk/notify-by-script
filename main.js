/**
 * Notify by Script Condition Google Chrome Browser extension.
 *
 * @author Ufuk Uzun
 */

// Create alarm
// Documentation for "chrome.alarms": https://developer.chrome.com/extensions/alarms
chrome.alarms.create("USD_TO_TRY_FX_RATE", {periodInMinutes: 5});

// Configure what will happened when alarm triggered
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("Alarm triggered: " + alarm.name);

    var result = eval(
        "(function () {" +
        "    var responseText = $.ajax({" +
        "        type: 'GET'," +
        "        url: 'http://kur.doviz.com/serbest-piyasa/amerikan-dolari'," +
        "        async: false" +
        "    }).responseText;" +
        "return $($($.parseHTML(responseText)).find('.flag.flag-USD').parent().parent().find('span.color-green')[0]).text();" +
        "})()"
    );

    notify("USD / TRY", result);
});

// Documentation for "chrome.notifications": https://developer.chrome.com/extensions/notifications
function notify(title, message) {
    chrome.notifications.create("notify-by-condition", {
        "type": "basic",
        "title": title,
        "iconUrl": "https://raw.githubusercontent.com/ufuk/notify-by-script-condition/master/icon.png",
        "message": message
    });
};