'use strict';

// This function will decode an LTM persistence cookie
//    REF: https://github.com/CheungJ/BIG-IP-encoder-and-decoder
function decodeF5PersistenceCookie(cookieValue) {
    var ipSegments = [];
    var sumOfIPSegments = 0;
    var encodedIP;

    if (typeof cookieValue === 'number') {
        cookieValue += '';
    }

    encodedIP = new Number(cookieValue.split('.')[0]);

    /*
    * Where the format of the IP is a.b.c.d, the calculation is:
    * a = (cookieValue % 256)
    * b = ((cookieValue - a) / 256) % 256
    * c = (((cookieValue - a - b) / 256) / 256) % 256
    * d = ((((cookieValue - a - b - c) / 256) / 256) / 256) % 256
    */
    for (var i = 0; i < 4; i++) {
        var ip = encodedIP;
        var n = Math.pow(256, i);

        ip -= sumOfIPSegments;
        ip = (ip / n);
        ip = (ip % 256);
        ip = Math.floor(ip);
        sumOfIPSegments += ip;
        ipSegments.push(ip);
    }

    return ipSegments.join('.');
}

// This function will decode a HEX string into ASCII
function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
function delCookie(el) {
    console.log(el);
}

var app = angular.module("MyPopup", []);
app.controller('popupCtrl', function($scope) {
    $scope.tab = null;

    // APM rewriter stuff
    $scope.rewrite = {
        enabled: false,
        host: "",
        uri: "",
        link: ""
    };

    // Cookies
    $scope.cookies= [];
    $scope.hasCookies= function() { return $scope.cookies.length > 0; }
    $scope.deleteCookie = function(cookie) {
        chrome.cookies.remove({url:$scope.tab.url, name: cookie.name}, function(details) {
            if (details) {
                var idx = $scope.cookies.indexOf(cookie);
                $scope.cookies.splice(idx,1);
                $scope.$digest();
            }
        });
    };

    // Check the page
    // Process the currently active tab
    // REF: https://developer.chrome.com/extensions/tabs#method-query
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        $scope.tab = tabs[0];
        if (!$scope.tab) return;

        // APM rewriter uses the format /f5-w-[HEX-Encoded URL]$$/, so we'll look for that
        var matches = $scope.tab.url.match(/f5-w-(.*?)\$\$(\/.*)/);
        if (matches) {
            // Show the APM section (decoding the url);
            $scope.rewrite.enabled = true;
            $scope.rewrite.host    = hex2a(matches[1]);
            $scope.rewrite.uri     = matches[2];
            $scope.rewrite.link    = $scope.rewrite.host + $scope.rewrite.uri;
            $scope.$digest();
        }

        // List the cookies for this domain
        // REF: https://support.f5.com/kb/en-us/solutions/public/15000/300/sol15387.html
        // REF: https://developer.chrome.com/extensions/cookies#method-getAll
        chrome.cookies.getAll({url: $scope.tab.url}, function(cookies) {
            for (var i=0;i<cookies.length;i++) {
                cookies[i].persistence = (cookies[i].name.indexOf("BIGipServer") == 0
                                          ? decodeF5PersistenceCookie(cookies[i].value)
                                          : null);
            }
            $scope.cookies = cookies;
            $scope.$digest();
        });
    });
});
