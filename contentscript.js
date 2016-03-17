// This function will decode a HEX string into ASCII
window.hex2ascii = function(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// The background page is asking us to find an address on the page.
if (window == top) {
    chrome.extension.onMessage.addListener(function(req, sender, sendResponse) {
        if (false && !document.getElementById("f5Overlay")) {
            console.log("Building overlay");
            var div = document.createElement("div");
            div.attributes.id = "f5Overlay";
            div.innerHTML = "Testing";
            div.style.zIndex = 999999;
            div.style.display = "blocK";
            div.style.position = "absolute";
            div.style.top = "0";
            div.style.right = "0";
            div.style.padding = "5px";
            div.style.border = "solid 1px #AAA";
            div.style.backgroundColor = "rgba(200,200,200,.5)";
            div.style.fontSize = ".75em";
            div.style.fontStyle = "italic";
            div.style.color = "#FFF";
            document.body.appendChild(div);
        }
        
        sendResponse(window.location);        
    });
}