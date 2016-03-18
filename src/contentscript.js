// This function will decode a HEX string into ASCII
window.hex2ascii = function(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// The background page is asking us to find an address on the page.
if (window == top) {
    chrome.extension.onMessage.addListener(function(req, sender, sendResponse) { sendResponse(window.location); });
}