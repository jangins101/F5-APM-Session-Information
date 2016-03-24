// This function will decode a HEX string into ASCII
function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

document.addEventListener('DOMContentLoaded', function() {
    // Process the currently active tab
    // REF: https://developer.chrome.com/extensions/tabs#method-query
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        if (!tab) return;
        
        // APM rewriter uses the format /f5-w-[HEX-Encoded URL]$$/, so we'll look for that
        var matches = tab.url.match(/f5-w-(.*?)\$\$(\/.*)/);
        if (matches) {
            // Show the APM section (decoding the url);
            document.getElementById("apm").style.display = "block";
            
            var data = {
                url: url,
                hostEncoded: matches[1],
                host: hex2a(matches[1]),
                uri: matches[2]
            };
            
            document.getElementById("host").innerText = data.host;
            document.getElementById("uri").innerText = data.uri;
            document.getElementById("url").innerHTML = "<a target='_blank' href='" + data.host + data.uri + "'>" + data.host + data.uri + "</a>";
        }
        

        // List the cookies for this domain
        // REF: https://support.f5.com/kb/en-us/solutions/public/15000/300/sol15387.html
        // REF: https://developer.chrome.com/extensions/cookies#method-getAll
        chrome.cookies.getAll({url: tab.url}, function(cookies) {
            var el = document.getElementById("cookies");
            
            // Show the cookies section
            if (cookies) el.style.display = "block";
            
            // Build a table for the cookies
            var html = "<table cellpadding=0 cellspacing=0><thead><tr><th>Name</th><th>Domain</th><th>Value</th></tr></thead><tbody>";
            for(var i=0;i<cookies.length;i++) {
                html += "<tr><td>" + cookies[i].name + "</td><td>" + cookies[i].domain + "</td><td>" + cookies[i].value + "</td></tr>";
            }
            html += "</tbody></table>";
            el.innerHTML = html;
        });
    });
}, false);
