var debug = true;

// REF: http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
        this.splice(i, 1);
        i--;
        }
    }
    return this;
};

// Wrap the console.log function under debug flag
function log(msg) {
    if (debug) {console.log(msg)};
}


// This function will decode a HEX string into ASCII
function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// Grab data from localStorage
var storagePrefix = "F5ApmExtensionSettings_";
var defSettings = {
    // Enable debug header on requests for a given domain
    enableDebug: false,
    debugHeaderName: "DEBUG_F5",
    debugHeaderValue: "1",
    debugDomains: "",

    // Enable the extension on a given header value for the Server header
    enableOnHeaderServer: false,
    onHeaderServerValue: "Bigip"
}
function LoadSetting(name) {
    return (localStorage[storagePrefix + name] || defSettings[name]);
}
function SetSetting(name, value) {
    localStorage[storagePrefix + name] = value;
}