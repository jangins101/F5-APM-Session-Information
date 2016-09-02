'use strict';

var app = angular.module("MyOptions", []);
app.controller('optionsCtrl', function($scope, optionsStorage) {
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
    }
    $scope.save = function() {
        console.log("save: options saved");
        optionsStorage.save($scope.options);
    };
    $scope.cancel = function() {
        console.log("cancel: options update cancelled");
        $scope.reload();
    }
    $scope.reset = function() {
        console.log("reset: options reset to default");
        $scope.optionsStorage.reset();
        $scope.reload();
    }

    // Initally load the stuff
    $scope.reload();
});

app.service('optionsStorage', function ($q) {
    var _this = this;
    this.defaults = {
            // Enable debug header on requests for a given domain
            enableDebug: false,
            debugHeaderName: "DEBUG_F5",
            debugHeaderValue: "1",
            debugDomains: "",
            debugDomainsParsed: function() {
                return this.debugDomains.split(/,|\n/g);
            },

            // Enable the extension on a given header value for the Server header
            enableOnHeaderServer: false,
            onHeaderServerValue: "Bigip"
        };
    this.data = null; //angular.copy(this.defaults);

    this.load = function(callback) {
        console.log("storage.load: getting options from storage")
        chrome.storage.sync.get('options', function(keys) {
            console.log("storage.load.get: options retireved");
            _this.data = keys.options;// ? keys.options : angular.copy(_this.defaults);
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
        _this.save(angular.copy(_this.defaults));
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
