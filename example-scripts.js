// Checks USD/TRY exchange rate from doviz.com
(function () {
    var responseText = $.ajax({
        type: 'GET',
        url: 'http://www.doviz.com',
        async: false
    }).responseText;
    var rate = $($($.parseHTML(responseText)).find('.menu-row2')[1]).text();
    return {title: 'USD / TRY', message: rate};
})()