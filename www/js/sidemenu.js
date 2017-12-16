/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * sidemenu.js
 */

// This code from
// https://stackoverflow.com/a/6177502
$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
}


function openmenu() {
    if ($('#swipe-nav').css('display') == 'none') {
        $('#swipe-shader').show("fade", {}, 300);
        $('#swipe-nav').show("slide", {direction: "left"}, 300);
    }
}

function closemenu() {
    if ($('#swipe-nav').css('display') != 'none') {
        $('#swipe-shader').hide("fade", {}, 300);
        $('#swipe-nav').hide("slide", {direction: "left"}, 300);
    }
}

function togglemenu() {
    if ($('#swipe-nav').css('display') != 'none') {
        closemenu();
    } else {
        openmenu();
    }
}

$(document).ready(function () {
    $.fx.off = %%JQUERYFXOFF%%;
    var pages = $('#navbar-collapse .navbar-nav').html();
    var user = $('#navbar-collapse .navbar-right').html();
    var username = "%%USERNAME%%";
    var menucolor = $('.navbar').css('backgroundColor');
    var textcolor = $('.navbar .navbar-nav > li > a').css('color');
    var logo = "%%LOGO%%";
    $('body').append("<div id='swipe-nav'><div id='swipe-header' style='background-color: " + menucolor + "; color: " + textcolor + "'><a href='./app.php'><img id='swipe-appicon' src='" + logo + "' /></a> <div id='swipe-username'><i class='fa fa-user fa-fw'></i> " + username + "</div></div>\n<ul id='swipe-pages'>" + pages + "</ul><ul><li><a onclick='quitapp()'><i class='fa fa-sign-out fa-fw'></i> Back to Menu</a></li></ul></div>");
    $('body').append("<div id='swipe-shader'></div>");
    
    $(".navbar-brand").attr("href", "#");
    
    parent.postMessage("setcolor " + menucolor, "*");
    
    $('button.navbar-toggle[data-toggle="collapse"]').click(togglemenu);

    $('#swipe-shader').click(togglemenu);

    Hammer(document.body).on("swiperight", function (e) {
        var endPoint = e.pointers[0].pageX;
        var distance = e.distance;
        var origin = endPoint - distance;
        if (origin <= 25) {
            openmenu();
        }
    });
    
    Hammer(document.body).on("swipeleft", function (e) {
        closemenu();
    });
    
    window.addEventListener('message', function (event) {
        if (event.data.startsWith("coderesult~|~")) {
            var data = event.data.split("~|~");
            var ref = data[1];
            var code = data[2];
            $(ref).val(code);
            $(ref).trigger("input");
            $(ref).trigger("change");
            console.log("app: received " + event.data);
        } else if (event.data.startsWith("goback")) {
	    console.log("app: received " + event.data);
	    window.history.back();
	    parent.postMessage('goneback','*');
	}
    });
    
    setInterval(function () {
        $.getJSON("mobile/index.php", {action: "ping"}, function (d) {
            console.log("app: keepalive ping " + d.status);
        });
    }, 1000 * 60);
});

function quitapp() {
    parent.postMessage('quit','*');
}

function scancode(refstring) {
    console.log("app: sent scancode " + refstring);
    parent.postMessage('scancode ' + refstring, "*");
}