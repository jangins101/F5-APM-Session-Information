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

var app = angular.module("MyPopup", []);
app.filter('trust', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }])
app.controller('popupCtrl', function($scope) {
    $scope.tab = null;
    $scope.sessionLink = "asdfasd";

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
            chrome.pageAction.setTitle({tabId: $scope.tab.id, title: "Host: " + $scope.rewrite.host});
            $scope.$digest();
        }

        // List the cookies for this domain
        // REF: https://support.f5.com/kb/en-us/solutions/public/15000/300/sol15387.html
        // REF: https://developer.chrome.com/extensions/cookies#method-getAll
        chrome.cookies.getAll({url: $scope.tab.url}, function(cookies) {
            for (var i=0;i<cookies.length;i++) {
                // Check for persistence cookie
                cookies[i].persistence = (cookies[i].name.indexOf("BIGipServer") == 0 || cookies[i].value.match(/\d{9}\.\d{5}\.\d{4}/)
                                          ? decodeF5PersistenceCookie(cookies[i].value)
                                          : null);

                switch (cookies[i].name) {
                    case "LastMRH_Session":
                        $scope.sidLast8 = cookies[i].value;
                        $scope.sessionLink = "changed 01";
                        chrome.storage.sync.get('options', function(keys) {
                            $scope.sessionLink = "changed 02";
                            if (keys.options.enableSessionLink && keys.options.mgmtUrl != "") {
                                // Force UI apply
                                $scope.$apply(function(){
                                    //$scope.sessionLink = keys.options.mgmtUrl + "/tmui/Control/jspmap/tmui/overview/reports/current_sessions.jsp?&SearchString=*" + $scope.sidLast8 + "*";
                                    $scope.sessionLink = keys.options.mgmtUrl + "/sam/admin/reports/index.php?showSessionDetails=2&sid=" + $scope.sidLast8;
                                });
                            }
                        });

                        chrome.pageAction.getTitle({tabId: $scope.tab.id}, function(title){
                            if (title && title.length > 0) { title += "\n"; }
                            chrome.pageAction.setTitle({tabId: $scope.tab.id, title: (title + "Last 8 sid: " + $scope.sidLast8)});
                        });
                        break;
                    case "MRHSession":
                        $scope.sid = cookies[i].value;
                        var tempIdx = $scope.sid.length-8;
                        $scope.sidLabel = $scope.sid.slice(0,tempIdx) + " <strong style='margin-left:-2px;'>" + $scope.sid.slice(tempIdx) + "</strong>";
                        break;
                }
            }
            $scope.cookies = cookies;
            $scope.$digest();
        });
    });
});
