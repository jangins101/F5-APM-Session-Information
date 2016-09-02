// Used to determine whether a tab's requests should include the F5 debug header
var isF5 = [];

// DRY principal (Don't Repeat Yourself)
function enableExtension(tabId, title) {
    // Enable the pageAction
    // REF: https://developer.chrome.com/extensions/pageAction
    chrome.pageAction.show(tabId);
    isF5[tabId] = true;
}

// Whenever a tab is updated, this method will be called
// REF: https://developer.chrome.com/extensions/tabs#event-onUpdated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Clear out the pageAction title
    var tooltip = "", tipSid = false;

    // Check the tab URL for typical "/f5-w-$$" denoting an APM portal access page
    if (tab.url.indexOf("/f5-w-") >= 0) {
        // Update the title with the decoded internal hostname
        var matches = tab.url.match(/f5-w-(.*?)\$\$(\/.*)/);
        if (matches) { tooltip += 'Decoded Host: ' + hex2a(matches[1]) + '\n'; };

        // Enable the pageAction
        enableExtension(tabId);

        // No need to continue since we've already enable it
        //return;
    }

    // Check for known F5 cookies (including persistence cookies)
    chrome.cookies.getAll({url: tab.url}, function(cookies) {
        for(var i=0;i<cookies.length;i++) {
            if (cookies[i].name == "MRHSession" || cookies[i].name.indexOf("BIGipServer") == 0) {
                enableExtension(tabId);
            } else if (cookies[i].name == "LastMRH_Session" && !tipSid) {
                tooltip += 'Last 8 Sid: ' + cookies[i].value;
                tipSid = true;
            }
        }

        // Update the tooltip
        if (tooltip != "") { chrome.pageAction.setTitle({tabId: tabId, title: tooltip}); }
    });
});

/*

// NOT YET IMPLEMENTED PROPERLY
//  * Need to figure out how to deal with chrome storage here to get options


// Send DEBUG header on every F5 APM request
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (!isF5[details.tabId]) return;
        if (!(LoadSetting("enableDebug")==="true")) return;
        if (LoadSetting("debugDomains").search('^$|((^|,)' + details.url.replace(/^https?:\/\/(.*?)\/(.*)/, '$1') + ')') < 0) return;

        // Uncomment to log that we're adding the debug header to the request
        //chrome.tabs.get(details.tabId, function(tab){ console.log("Adding debug header to request - " + tab.url); });
        details.requestHeaders.push({name: (LoadSetting("debugHeaderName")), value:LoadSetting("debugHeaderValue")});
        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        if (!isF5[details.tabId]) return;
        if (!(LoadSetting("enableOnHeaderServer")==="true")) return;

        // Uncomment to log that headers were received
        //chrome.tabs.get(details.tabId, function(tab){ console.log("Received headers for F5 page - " +tab.url); });

        // TODO:
        //   Check for BigIp header in the Server field
        //     REF: https://developer.chrome.com/extensions/webRequest#event-onHeadersReceived
        for (var i = 0; i < details.responseHeaders.length; ++i) {
            if (details.responseHeaders[i].name === 'Server'
                    && details.responseHeaders[i].value === LoadSetting("onHeaderServerValue") ) {
                enableExtension(details.tabId);
                break;
            }
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking", "responseHeaders"]
);
*/
