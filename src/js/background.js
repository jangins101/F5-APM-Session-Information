// Used to determine whether a tab's requests should include the F5 debug header
var isF5 = [];
var isF5DebugDomains = [];

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
            if (cookies[i].name == "MRHSession" || cookies[i].name.indexOf("BIGipServer") == 0 || cookies[i].value.match(/\d{9}\.\d{5}\.\d{4}/)) {
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

// Load the settings
var _currentSettings;
function getSettings(keys) {
    _currentSettings = keys.options || angular.copy(defOptions);
    _currentSettings.debugDomainsParsed = function(escapeRegex) {
        try {
            var str = (!escapeRegex) ? this.debugDomains : this.debugDomains.replace(/\./g,"\\.").replace(/\*/g, '.*?');
            return str.split(/,|\n/g) || [];
        } catch(err) {
            console.log("Error parsing debug domains");
            console.log(err);
        }
    };
    _currentSettings.isHostInDebugDomains = function(hostname) {
        var list = this.debugDomainsParsed(true);
        for (var i=0; i<list.length; i++) {
            try {
                if (list[i] === hostname) return true;
                if (hostname.match(list[i])) return true;
            } catch(err) {
                console.log("Error checking hostname in debug domains");
                console.log(err);
            }
        }
        return false;
    };
    console.log(_currentSettings);
}
function getSettingsWrapper() {
    chrome.storage.sync.get('options', getSettings);
}
getSettingsWrapper();
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.isDirty == "settings") {
            getSettingsWrapper();
            isF5DebugDomains = [];
        }
    });

// Send DEBUG header on every F5 APM request
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (!isF5[details.tabId]) return;
        if (!_currentSettings.enableDebug) return;
        var host = details.url.replace(/^https?:\/\/(.*?)\/(.*)/, '$1');
        if (!(_currentSettings.isHostInDebugDomains(host))) return;

        isF5DebugDomains[host] = true;
        // Uncomment to log that we're adding the debug header to the request
        //chrome.tabs.get(details.tabId, function(tab){ console.log("Adding debug header to request - " + tab.url); });
        details.requestHeaders.push({name: _currentSettings.debugHeaderName, value:_currentSettings.debugHeaderValue});
        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
);


// REF: https://developer.chrome.com/extensions/webRequest#event-onHeadersReceived
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        if (!isF5[details.tabId]) return;

        // Uncomment to log that headers were received
        //chrome.tabs.get(details.tabId, function(tab){ console.log("Received headers for F5 page - " +tab.url); });
        
        // TODO: fix this. need to get the process of this method done right
        if (_currentSettings.enableDebug || _currentSettings.enableOnHeaderServer) {
            for (var i=0; i<details.responseHeaders.length; i++) {
                switch (details.responseHeaders[i].name) {
                    // Check for expected header value in Server field
                    case "Server":
                        if (details.responseHeaders[i].value === _currentSettings.onHeaderServerValue) {
                            enableExtension(details.tabId);
                        }
                        break;
                        
                    // Check for response data in debug header
                    case _currentSettings.debugHeaderName:
                        // TODO: send Message to popup to update scope json or else set a variable here and use a message to get it back to the popup when it opens. change will clear the json array. referrered resources will append.
                        break;
                }
            }
        }

        // TODO:
        //   Check for BigIp header in the Server field
        //   Add options page section for this
        if (_currentSettings.enableOnHeaderServer) {
            for (var i = 0; i < details.responseHeaders.length; ++i) {
                if (details.responseHeaders[i].name === 'Server' && details.responseHeaders[i].value === _currentSettings.onHeaderServerValue) {
                    enableExtension(details.tabId);
                    break;
                }
            }
        }
        
        // Grab debug headers from the response header
        if (_currentSettings.enableDebug) {
            console.log("Debug");
            if (details.responseHeaders[_currentSettings.debugHeaderName]) {
                console.log("Reponse headers");
                console.log(debug.responseHeaders);
            }
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking", "responseHeaders"]
);
/*
// REF: https://developer.chrome.com/extensions/webRequest#event-onResponseStarted
chrome.webRequest.onResponseStarted.addListener(function(details) {
    if (!isF5[details.tabId]) return;
    if (!_currentSettings.enableDebug) return;
    var host = details.url.replace(/^https?:\/\/(.*?)\/(.*)/, '$1');
    if (!(_currentSettings.isHostInDebugDomains(host))) return;
    
    console.log("onResponseStarted: " + details.url);
    console.log(details);
});
*/
