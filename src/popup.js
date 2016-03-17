// This function will decode a HEX string into ASCII
function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

document.addEventListener('DOMContentLoaded', function() {    
    // Act on the current tab
    chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        
        if (url.indexOf("/f5-w-" >= 0)) {            
            var matches = url.match(/f5-w-(.*?)\$\$(\/.*)/);
            var data = {
                url: url,
                hostEncoded: matches[1],
                host: hex2a(matches[1]),
                uri: matches[2]
            };            
            document.getElementById("badUrl").style.display = "none";
            document.getElementById("goodUrl").style.display = "block";
            document.getElementById("host").innerHTML = data.host;
            document.getElementById("uri").innerHTML = data.uri;
            document.getElementById("url").innerHTML = data.host + data.uri;            
        } else {
            document.getElementById("badUrl").style.display = "block";
            document.getElementById("goodUrl").style.display = "none";
        }
    });
}, false);