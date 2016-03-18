// The background page is asking us for the tab url.
if (window == top) {
    chrome.extension.onMessage.addListener(function(req, sender, sendResponse) { sendResponse(window.location); });
}