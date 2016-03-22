// Whenever a tab is updated, this method will be called
// REF: https://developer.chrome.com/extensions/tabs#event-onUpdated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
    // Check the tab URL for typical "/f5-w-$$" denoting an APM portal access page
    if (tab.url.indexOf("/f5-w-") >= 0) {
        // Enable the pageAction
        // REF: https://developer.chrome.com/extensions/pageAction
        chrome.pageAction.show(tabId);
        
        // No need to continue since we've already enable it
        return;
    }
    
    // Check for an MRHSession cookie, which would denote an APM session 
    chrome.cookies.get({url: tab.url, name: "MRHSession"}, function(cookie) {
        // The callback is always called, even if the cookie wasn't found.
        if (!cookie) return;
        
        // Enable the pageAction
        // REF: https://developer.chrome.com/extensions/pageAction
        chrome.pageAction.show(tabId);
        
        // No need to continue since we've already enable it
        return;
    });
});