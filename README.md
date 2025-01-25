# Notify by Script

Google Chrome Browser extension for setting notifications that prepared by scripts.

Now available
on [Chrome Web Store](https://chrome.google.com/webstore/detail/notify-by-script/idgiodaooapkmmipoahlcmggofokcilg)

![options-page](https://raw.githubusercontent.com/ufuk/notify-by-script/master/document-assets/options-page.png)

## Use Cases

You can create alarms and notifications about anything you need. Here is some examples:

### Health check

Write a script to check your website/service is available or not.

```javascript
// Check health of your website or service
(function () {
  var response = $.ajax({
    type: "GET",
    url: "<YOUR_WEBSITE_URL>",
    async: false,
  });
  return {
    title: "Health Check",
    message: "Status: " + response.status,
  };
})();
```

### Get some web content, then parse and notify

For example checks some currency's exchange rate and notify:

```javascript
// Checks USD/TRY exchange rate from doviz.com
(function () {
  var responseText = $.ajax({
    type: "GET",
    url: "https://www.doviz.com",
    async: false,
  }).responseText;
  var rate = $($($.parseHTML(responseText)).find(".menu-row2")[1]).text();
  return {
    title: "USD/TRY",
    message: rate,
  };
})();
```

```javascript
// Checks BTC/TRY or ETH/TRY exchange rate from btcturk.com
(function () {
  var responseText = $.ajax({
    type: "GET",
    url: "https://www.btcturk.com/",
    async: false,
  }).responseText;
  var $parsedResponse = $($.parseHTML(responseText));
  var rate = $($parsedResponse.find(".topBarDailyPrice .askPrice"))
    .text()
    .trim();
  var title = $($parsedResponse.find(".topBarDailyPrice .title")).text().trim();
  return {
    title: title,
    message: rate + " ₺",
  };
})();
```

### Remind yourself to drink water

You should drink at least 2 litres water everyday. So, make Notify by Script to remind you while you surfing:

```javascript
// Remind yourself to drink water
(function () {
  return {
    title: "Wassup Healthy",
    message: "One more cup of water?",
  };
})();
```

## Scripting

### Preparing notification content

Notify by Script waits in hope a script that results with a JSON object which contains two fields: `title` and `message`
. These values will be used for creating notifications for you.

```javascript
(function () {
  return {
    title: "Hello World",
    message:
      "Notify by Script is here to allow you setting alarms with custom notifications.",
  };
})();
```

![example-notification](https://raw.githubusercontent.com/ufuk/notify-by-script/master/document-assets/example-notification.png)

### Conditional notification

Return something `undefined` or "nothing" if you don't want to display notification for that cycle. For example, in
health check use case, when you want to display notification if only status is not 200 (OK), return nothing id status is
not 200 (OK):

```javascript
(function () {
  var response = $.ajax({
    type: "GET",
    url: "<YOUR_WEBSITE_URL>",
    async: false,
  });

  if (response.status != 200) {
    return {
      title: "Health Check",
      message: "Something is wrong! Status: " + response.status,
    };
  }
})();
```
