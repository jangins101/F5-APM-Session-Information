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

    $scope.reload = function() {
        $scope.optionsStorage.load(function(data) {
            console.log("reload: options loaded");
            $scope.options = data;
            $scope.$digest();
            //$scope.$apply();
        });
    };
    $scope.clearAlertIn = function(sec) {
        $timeout(function() {
            $scope.alert.active = false;
            $scope.alert.class = "";
            $scope.alert.message = "";
        }, 5000);
    };
    $scope.save = function() {
        console.log("save: options saved");
        optionsStorage.save($scope.options);

        $scope.alert.active = true;
        $scope.alert.class = 'alert-success';
        $scope.alert.message = 'Settings saved';
        $scope.clearAlertIn(5000);
    };
    $scope.cancel = function() {
        console.log("cancel: options update cancelled");
        $scope.reload();

        $scope.alert.active = true;
        $scope.alert.class = 'alert-danger';
        $scope.alert.message = 'Changed cancelled';
        $scope.clearAlertIn(5000);
    }
    $scope.reset = function() {
        console.log("reset: options reset to default");
        $scope.optionsStorage.reset();
        $scope.reload();

        $scope.alert.active = true;
        $scope.alert.class = 'alert-warning';
        $scope.alert.message = 'Settings reset to default values';
        $scope.clearAlertIn(5000);
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
