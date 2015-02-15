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

var appInitialized = false;
var browser = true; // temporary solution

// TODO (migrate): Migrate to Angular controller codes
//Please call this "createDB();" when you develop via desktop browser
var emoState = "";
            
// Cordova is ready
function createDB() {
    var db = window.openDatabase("Database", "1.0", "EmoTracker Demo", 200000);
    db.transaction(createTable, errorCB, successCB);
}

// Create database 
function createTable(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS demo (id unique, data, note)');
}

// Empty records
function emptyEmos() {
    var db = window.openDatabase("Database", "1.0", "EmoTracker Demo", 200000);
    db.transaction(deleteAll, errorCB, successCB);
    refreshRecords();
}
            
// Delete all reconrds 
function deleteAll(tx) {
    tx.executeSql('DELETE FROM demo');
}            
            
            
// Insert Emo
function insertEmo(input) {
    var db = window.openDatabase("Database", "1.0", "EmoTracker Demo", 200000);
    emoState = input;
    db.transaction(insert, errorCB, successCB);
    refreshRecords();
}
            
// Insert 
function insert(tx) {
    var dt = (new Date).getTime();
    tx.executeSql('INSERT INTO demo (id, data) VALUES (' + dt + ', "' + emoState + '")');
}
            
            
// Refresh records
function refreshRecords() {
    var db = window.openDatabase("Database", "1.0", "EmoTracker Demo", 200000);
    db.transaction(retreiveRecords, errorCB, successCB);
}
            
// Retreive reconds 
function retreiveRecords(tx) {
    tx.executeSql('SELECT * FROM demo order by id desc',[] , passed, errorCB);
}

  
// Transaction error callback
function errorCB(tx, err) {
    alert("Error processing SQL: " + err);
}

// Transaction success callback
function successCB() {
    //alert("success!");
}  

    
// Transaction success callback
function passed(tx, results) {
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
        content = content +                '<p><code data-anchor-id="core-list.attributes.height">'+ new Date(results.rows.item(i).id).toISOString() +'</code></p>'
        content = content +            '</div>';
        content = content +            '<div class="details-info" flex="" three="">';
        content = content +                '<marked-element text="{{attribute.description}}">';
        content = content +                    '<p>' + results.rows.item(i).data + '</p>';
        content = content +                '</marked-element>';
        content = content +            '</div>';
        content = content +        '</div>';
    }
    
    var tablelist = $("#table");
    content = content +        '</section>';
    tablelist.remove();
    resultDiv.append(content);
}

// end of :TODO (migrate)


function appInit(){
    if (!appInitialized) {
        //Unleash all the cool javascript crazyness
        angular.bootstrap(document, ['emoApp']);
        createDB();
        
        document.addEventListener("backbutton", function(e){
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

var emoApp = angular.module("emoApp", ['ngRoute', 'ngAnimate']);

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

emoApp.controller("homeController", function($scope) {
    $scope.name = "Home";
});

emoApp.controller("reportController", function($scope) {
    $scope.name = "Report";
});

emoApp.controller("debugController", function($scope) {
    $scope.name = "Debug";
    refreshRecords();
});

if (browser) {
    appInit();
}