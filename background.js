function checkUrl(tabId) {
    chrome.tabs.sendMessage(tabId, {}, function(location) {               
        if (location && location.pathname.indexOf("/f5-w-") >= 0) {
            chrome.pageAction.show(tabId);
        } else {
            chrome.pageAction.hide(tabId);
        }
    });
}

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [ new chrome.declarativeContent.PageStateMatcher({ pageUrl: { pathPrefix: '/f5-w-' } }) ],
            actions: [ new chrome.declarativeContent.ShowPageAction() ]
        }]);
    });
});

chrome.tabs.onUpdated.addListener(function(tabId)           { checkUrl(tabId); });
chrome.tabs.onSelectionChanged.addListener(function(tabId)  { checkUrl(tabId); });
chrome.tabs.onActivated.addListener(function(info)          { checkUrl(info.tabId); });

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    checkUrl(tabs[0].id);
});