// Hello World from Notify by Script
(function () {
    return {
        title: 'Hello World',
        message: 'Notify by Script is here to allow you setting alarms with custom notifications.'
    };
})()


// Checks USD/TRY exchange rate from doviz.com
(function () {
    var responseText = $.ajax({
        type: 'GET',
        url: 'https://www.doviz.com',
        async: false
    }).responseText;
    var rate = $($($.parseHTML(responseText)).find('.menu-row2')[1]).text();
    return {
        title: 'USD/TRY',
        message: rate
    };
})()


// Check health of your website or service
(function () {
    var response = $.ajax({
        type: 'GET',
        url: '<YOUR_WEBSITE_URL>',
        async: false
    });
    return {
        title: 'Health Check',
        message: 'Status: ' + response.status
    };
})()


// Remind yourself to drink water
(function () {
    return {
        title: 'Wassup Healthy',
        message: 'One more cup of water?'
    };
})()
