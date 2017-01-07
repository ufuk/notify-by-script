/**
 * Notify by Script Condition Google Chrome Browser extension.
 *
 * @author Ufuk Uzun
 */

// Create alarm
// Documentation for "chrome.alarms": https://developer.chrome.com/extensions/alarms
chrome.alarms.create("OFFENE_STELLEN_ALARM", {periodInMinutes: 1});

// Configure what will happened when alarm triggered
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("Alarm triggered: " + alarm.name);

    $.get("http://www.innflow.com/offene-stellen", function (responseText) {
        console.log("OK");

        // Find out public model that using to render page by "wix"
        var extractedPublicModel = JSON.parse(responseText.match(/var publicModel = {.*}/g)[0].replace('var publicModel = ', ''));
        extractedPublicModel.pageList.pages.forEach(function (e) {
            if (e.title == 'OFFENE STELLEN') {
                console.log(e);

                $.get("https://static.wixstatic.com/sites/" + e.pageJsonFileName + ".z?v=3", function (responseJson) {
                    // Get item count
                    var itemCount = $(JSON.stringify(responseJson).match(/<ul.*<\/ul>/g)[0]).find('li').length;
                    if (itemCount > 6) {
                        var message = "New item! Current item count: " + itemCount;
                        console.log(message);
                        notify("New item!", message);
                    } else {
                        var message = "No new item. Current item count: " + itemCount;
                        console.log(message);
                        notify("No new item", message);
                    }
                }).fail(function () {
                    console.log("ERROR");
                });
            }
        });
    }).fail(function () {
        console.log("ERROR");
    });
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