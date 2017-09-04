'use strict';

var app = angular.module("MyOptions", []);
app.controller('optionsCtrl', function($scope, $timeout, optionsStorage) {
    $scope.alert = {status: "", message: ""};
    $scope.optionsStorage = optionsStorage;
    $scope.$watch('optionsStorage.data', function() {
        console.log("optionsStorage.data watch executed");
        $scope.options = $scope.optionsStorage.data;
        //$scope.$apply();
    });

    $scope.getHosts = function() {
        var lsn = "F5ApmExtensionSettings_usesF5";
        var hosts = chrome.extension.getBackgroundPage().localStorage[lsn];
        var hostsArray = (hosts || "").split(/[,;]/).sort();
        return hostsArray;
    };
    $scope.reload = function() {
        $scope.optionsStorage.load(function(data) {
            console.log("reload: options loaded");
            $scope.options = data;
            $scope.$digest();
            //$scope.$apply();
        });
    };
    $scope.alertFor = function(timeout, cssClass, msg) {
        $scope.alert.active = true;
        $scope.alert.class = cssClass;
        $scope.alert.message = msg;
        
        $timeout(function() {
            $scope.alert.active = false;
            $scope.alert.class = "";
            $scope.alert.message = "";
        }, timeout);
    };
    $scope.save = function() {
        console.log("save: options saved");
        optionsStorage.save($scope.options);
        $scope.alertFor(5000, 'alert-success', 'Settings saved');
    };
    $scope.cancel = function() {
        console.log("cancel: options update cancelled");
        $scope.reload();
        $scope.alertFor(5000, 'alert-danger', 'Changed cancelled');
    }
    $scope.reset = function() {
        console.log("reset: options reset to default");
        $scope.optionsStorage.reset();
        $scope.reload();
        $scope.alertFor(5000, 'alert-warning', 'Settings reset to default values');
    }

    // Initally load the stuff
    $scope.reload();
});

app.service('optionsStorage', function ($q) {
    var _this = this;
    this.data = null;

    this.load = function(callback) {
        console.log("storage.load: getting options from storage")
        chrome.storage.sync.get('options', function(keys) {
            console.log("storage.load.get: options retireved");
            _this.data = keys.options ? keys.options : angular.copy(defSettings);
            console.log(_this.data);

            // Execute the callback
            if (callback) callback(_this.data);
        });
    };
    this.save = function(data) {
        console.log("storage.save: saving options");
        _this.data = data;
        chrome.storage.sync.set({options: _this.data}, function() {
            console.log("storage.save.set: options saved");
           console.log("Saved options to Chrome storage");
        });
        console.log(data);

        chrome.runtime.sendMessage({isDirty: 'settings'}, function(response) {
            console.log("messge response received");
            console.log(response);
        });
    };
    this.reset = function(callback) {
        console.log("storage.reset: resetting options to default");
        _this.save(angular.copy(defSettings));
    };

    // Load the options
    this.load();
});




/*
// Example code to fetch current tab and save to $scope
chrome.tabs.getCurrent(function(tab) {
   // $apply() is needed to trigger the digest cycle to refresh the UI
    $scope.$apply(function(){
        $scope.title = tab.title; //Executed in digest loop.
    });
});
*/
