/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
"use strict";

var pz_debug;

var appInitialized = false;
var browser = true; // temporary solution

function appInit() {
    if (!appInitialized) {
        // Unleash all the cool javascript crazyness
        angular.bootstrap(document, ['emoApp']);
        
        // Avoid going back one page, exit app instead
        document.addEventListener("backbutton", function (e){
            navigator.app.exitApp();}, false);
        
        appInitialized = true;
    }
}

//TODO: We will keep this for now. Let's replace this with AngularJS animation later on

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        
        appInit();
    }
};

var emoApp = angular.module("emoApp", ['ngRoute', 'ngAnimate', 'chart.js']);

emoApp.config(function($routeProvider) {
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl : 'pages/home.html',
            controller  : 'homeController'
        })

        // route for the about page
        .when('/report', {
            templateUrl : 'pages/report.html',
            controller  : 'reportController'
        })

        // route for the contact page
        .when('/debug', {
            templateUrl : 'pages/debug.html',
            controller  : 'debugController'
        });
    
});

emoApp.controller("headerController", function($scope, $location){
    $scope.test = $location.path();
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});

emoApp.service("DatabaseHelper", function($window){
    this.openDatabase = function() {
        return $window.openDatabase("Database", "1.0", "EmoTracker Demo", 200000);
    };
    
    // Cordova is ready
    this.createDB = function() {
        var db = this.openDatabase();
        db.transaction(this.createTable, this.errorCB, this.successCB);
        
        // DEBUG::
        //db.transaction(this.createFixtures)
    };
    
    this.createFixtures = function(tx) {
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (1430632040.0, "Sad", "This is a test")')
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (1430545640.0, "Happy", "This is a test")')
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (1430459240.0, "Happy", "This is a test")')
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (1430372840.0, "Happy", "This is a test")')
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (1430286440.0, "Sad", "This is a test")')
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (1430200040.0, "Sad", "This is a test")')
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (1430113640.0, "Sad", "This is a test")')
    }

    // Create database 
    this.createTable = function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS demo (id unique, data, note)');
    };

    // Empty records
    this.emptyEmos = function() {
        var db = this.openDatabase();
        db.transaction(this.deleteAll, this.errorCB, this.successCB);
        //this.refreshRecords();
    };

    // Delete all reconrds 
    this.deleteAll = function(tx) {
        tx.executeSql('DELETE FROM demo');
    };
    
    this.insert = function(tx, emoState, note) {
        var dt = (new Date).getTime() / 1000;
        tx.executeSql('INSERT INTO demo (id, data, note) VALUES (' + dt + ', "' + emoState + '", "' + note + '")');
    };
    
    this.refreshRecords = function() {
        var db = this.openDatabase();
        db.transaction(this.retreiveRecords, this.errorCB, this.successCB);
    };
    
    // Transaction error callback
    this.errorCB = function(tx, err) {
        alert("Error processing SQL: " + err);
    };

    // Transaction success callback
    this.successCB = function() {
        //alert("success!");
    };
    
    // Transaction success callback
    var updateView = function(fx, results) {
        var len = results.rows.length;
        var resultDiv = $('#mydiv');
        var data = "";

        var content = "";
        content = content +        '<section id="table" class="box attribute-box">';
        content = content +        '<h3 data-anchor-id="core-list.attributes">Emotions</h3>';
        content = content +        '<template repeat="{{attribute in data.attributes}}"></template>';

        for (var i=0; i<len; i++){
            content = content +            '<div class="details" horizontal="" layout="">';
            content = content +            '<div class="details-name" flex="">';
            content = content +                '<p><code data-anchor-id="core-list.attributes.height">'+ new Date(results.rows.item(i).id * 1000).toISOString() +'</code></p>'
            content = content +            '</div>';
            content = content +            '<div class="details-info" flex="" three="">';
            content = content +                '<marked-element text="{{attribute.description}}">';
            content = content +                    '<p>' + results.rows.item(i).data + '</p>';
            content = content +                '</marked-element>';
            content = content +            '</div>';
            content = content +            '<div>' + results.rows.item(i).note + '</div>';
            content = content +        '</div>';
        }

        var tablelist = $("#table");
        content = content +        '</section>';
        tablelist.remove();
        resultDiv.append(content);
    };
    
    // Retreive reconds 
    this.retreiveRecords = function (tx) {
        tx.executeSql('SELECT * FROM demo order by id desc',[] , updateView, this.errorCB);
    };
});

emoApp.run(['DatabaseHelper', function(dh) {
    dh.createDB();
}]);

emoApp.controller("homeController", ['$scope', 'DatabaseHelper', function($scope, dh) {
    $scope.name = "Home";
    
    $scope.selectedEmo = '';
    $scope.newUpdate = '';
    
    $scope.setEmo = function(emoState) {
        $scope.selectedEmo = emoState;
    }
    
    $scope.insertEmo = function() {
        var db = dh.openDatabase();
        db.transaction(function(tx) { dh.insert(tx, $scope.selectedEmo, $scope.newUpdate) }, dh.errorCB, dh.successCB);
        //dh.refreshRecords();
    }
}]);

emoApp.controller("reportController", ['$scope', 'DatabaseHelper', function($scope, dh) {
    var db = dh.openDatabase();
    db.transaction(function(tx) { $scope.getData(tx) });
    
    $scope.getData = function(tx) {
        tx.executeSql('SELECT * FROM demo order by id desc limit 7',[] , $scope.updateView, dh.errorCB);
    }
    
    $scope.updateView = function(tx, result) {
        $scope.$apply( function() {
            
            $scope.labels = []
            
            var weekday = new Array(7);
            weekday[0]=  "Sunday";
            weekday[1] = "Monday";
            weekday[2] = "Tuesday";
            weekday[3] = "Wednesday";
            weekday[4] = "Thursday";
            weekday[5] = "Friday";
            weekday[6] = "Saturday";
            
            var previous_date = (new Date(0));
            
            $scope.series = ['Sad', 'Happy'];
            $scope.data = [[],[]];
            
            for (var x = 0; x < result.rows.length; x++) {
                var item = result.rows.item(x);
                
                var currentDate = new Date(item.id * 1000);
                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                
                if (currentDate.getTime() != previous_date.getTime()) {
                    $scope.labels.unshift(weekday[currentDate.getDay()]);
                    previous_date = currentDate;
                    $scope.data[0].unshift(0);
                    $scope.data[1].unshift(0);
                }
                
                if (item.data == 'Sad') {
                    $scope.data[0][0]++;
                } else if (item.data == 'Happy') {
                    $scope.data[1][0]++;
                }
                
            }
        });
    }
    
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
}]);

emoApp.controller("debugController", ['$scope', 'DatabaseHelper', function($scope, dh) {
    $scope.name = "Debug";
    
    $scope.dh = dh;
    dh.refreshRecords();
}]);

if (browser) {
    appInit();
}