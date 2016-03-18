function toggleAction(tabId, url, forceShow) {
    if (forceShow || (url && url.indexOf("/f5-w-") >= 0)) {
        chrome.pageAction.show(tabId);
    } else {
        chrome.pageAction.hide(tabId);
    }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
    toggleAction(tabId, tab.url);
    
    chrome.cookies.get({url: tab.url, name: "MRHSession"}, function(cookie) {
        if (!cookie) return;
        
        console.log("got mrhsession");
        toggleAction(tabId, tab.url, true);
    });
    
    chrome.cookies.getAll({url: tab.url}, function(cookies) {
        console.log("got cookies");
        console.log(cookies);
    });
});