function GetLocalSettings() {
    // Grab from localStorage
    return $.extend({}, defSettings, {
        // Enable debug header on requests for a given domain
        enableDebug: (LoadSetting("enableDebug")==="true"),
        debugHeaderName: LoadSetting("debugHeaderName"),
        debugHeaderValue: LoadSetting("debugHeaderValue"),
        debugDomains: LoadSetting("debugDomains"),

        // Enable the extension on a given header value for the Server header
        enableOnHeaderServer: (LoadSetting("enableOnHeaderServer")==="true"),
        onHeaderServerValue: LoadSetting("onHeaderServerValue")
    });
}
function SetLocalSettings(settings) {
    // Enable debug header on requests for a given domain
    SetSetting("enableDebugHeader", settings.enableDebug);
    SetSetting("debugHeaderName", settings.debugHeaderName);
    SetSetting("debugHeaderValue", settings.debugHeaderValue);
    SetSetting("debugDomains", settings.debugDomains);

    // Enable the extension on a given header value for the Server header
    SetSetting("enableOnHeaderServer", settings.enableOnHeaderServer);
    SetSetting("onHeaderServerValue", settings.onHeaderServerValue);
}
function RetrieveUI() {
    return $.extend({}, defSettings, {
        // Enable debug header on requests for a given domain
        enableDebug: $("#cbEnableDebug").prop("checked"),
        debugHeaderName: $("#txtDebugHeaderName").val(),
        debugHeaderValue: $("#txtDebugHeaderValue").val(),
        debugDomains: $("#txtDebugIncludedDomains").val().split(/,|\n/).clean(""),

        // Enable the extension on a given header value for the Server header
        enableOnHeaderServer: $("#cbEnableOnHeaderServer").prop("checked"),
        onHeaderServerValue: $("#txtOnHeaderServerValue").val()
    });
}
function UpdateUI() {
    var settings = GetLocalSettings();

    // Enable debug header on requests for a given domain
    $("#cbEnableDebug").prop("checked", settings.enableDebug);
    $("#txtDebugHeaderName").val(settings.debugHeaderName);
    $("#txtDebugHeaderValue").val(settings.debugHeaderValue);
    $("#txtDebugIncludedDomains").val(settings.debugDomains.split().join("\n"));

    // Enable the extension on a given header value for the Server header
    $("#cbEnableOnHeaderServer").prop("checked", settings.enableOnHeaderServer);
    $("#txtOnHeaderServerValue").val(settings.onHeaderServerValue);
}

function loadSettings() {
    log("Load Settings");
    log(GetLocalSettings());

    UpdateUI();
}
function saveSettings() {
    log("Save Settings");

    log("  Previous");
    log(GetLocalSettings());

    SetLocalSettings(RetrieveUI());
    log("  Updated");
    log(GetLocalSettings());

    location.reload();
}
function resetSettings() {
    log("Reset Options");

    log("  Previous");
    log(GetLocalSettings());

    log("  Updated");
    SetLocalSettings(defSettings);
    log(GetLocalSettings());

	location.reload();
}

// Load the options on page load
$(document).ready(function() {
    $("#saveSettings").click(saveSettings);
    $("#resetSettings").click(resetSettings);
    loadSettings();
});
