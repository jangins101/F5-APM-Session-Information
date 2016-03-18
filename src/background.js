function toggleAction(tabId, url) {
    if (url && url.indexOf("/f5-w-") >= 0) {
        chrome.pageAction.show(tabId);
    } else {
        chrome.pageAction.hide(tabId);
    }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
    toggleAction(tabid, changInfo.url);
});