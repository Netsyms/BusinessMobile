/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

userinfo = null;

document.addEventListener("deviceready", function () {
    if (cordova.platformId == 'android') {
	StatusBar.backgroundColorByHexString("#1976d2");
    }

    // Enable/disable jQuery animations depending on user preference
    $.fx.off = !(localStorage.getItem("animations") === null || localStorage.getItem("animations") === "true");

    /* Fade out alerts */
    $(".alert .close").click(function (e) {
	$(this).parent().fadeOut("slow");
    });

    if (localStorage.getItem("setupcomplete")) {
	getuserinfo(function () {
	    openscreen("home");
	});
    } else {
	openscreen("setup1");
    }
    setTimeout(navigator.splashscreen.hide, 1000);
}, false);

/**
 * Fetch user info (name, email, etc) from the server and save to the global 
 * variable `userinfo`.
 * @param function callback An optional function to run if/when the request 
 * succeeds.
 */
function getuserinfo(callback) {
    $(".loading-text").text("Loading account...");
    $.post(localStorage.getItem("syncurl"), {
	username: localStorage.getItem("username"),
	key: localStorage.getItem("key"),
	password: localStorage.getItem("password"),
	action: "user_info"
    }, function (data) {
	if (data.status === 'OK') {
	    $(".loading-text").text("Loading...");
	    userinfo = data.info;
	    if (typeof callback == 'function') {
		callback();
	    }
	} else {
	    navigator.notification.alert(data.msg, null, "Error", 'Dismiss');
	    openscreen("homeloaderror");
	}
    }, "json").fail(function () {
	navigator.notification.alert("Could not connect to the server.  Try again later.", null, "Error", 'Dismiss');
	openscreen("homeloaderror");
    });
}

/**
 * Switches the app to the given screen.
 * @param {String} screenname The name of the screen to show.
 * @param {String} effect FADE, SLIDE, or nothing
 * @returns {undefined}
 */
function openscreen(screenname, effect) {
    if (effect === 'FADE') {
	$('#content-zone').fadeOut(300, function () {
	    $('#content-zone').load("views/" + screenname + ".html", function () {
		$('#content-zone').fadeIn(300);
	    });
	});
    } else if (effect === 'SLIDE') {
	$('#content-zone').slideToggle('400', function () {
	    $('#content-zone').load("views/" + screenname + ".html", function () {
		$('#content-zone').slideToggle('400');
	    });
	});
    } else {
	$('#content-zone').load("views/" + screenname + ".html");
    }
    currentscreen = screenname;
}

function openfragment(fragment, target, effect) {
    if (effect === 'FADE') {
	$(target).fadeOut('slow', function () {
	    $(target).load("views/" + fragment + ".html", function () {
		$(target).fadeIn('slow');
	    });
	});
    } else if (effect === 'SLIDE') {
	$(target).slideToggle('400', function () {
	    $(target).load("views/" + fragment + ".html", function () {
		$(target).slideToggle('400');
	    });
	});
    } else {
	$(target).load("views/" + fragment + ".html");
    }
}

/**
 * Set the navbar.
 * @param String,boolean type false if no navbar, "home" for the home screen, 
 * "settings" for settings, "app" for a custom title, or anything else for 
 * a simple one.
 * @param String title The title to show if type == "app"
 * @param String returnscreen Where to go back to.  Defaults to "home".
 * @returns {undefined}
 */
function setnavbar(type, title, returnscreen) {
    var navbar = $('#navbar-header');
    if (type == false) {
	$('#navbar').css('display', 'none');
	$('#content-zone').css('margin-top', '0px');
    } else {
	if (cordova.platformId == 'android') {
	    StatusBar.backgroundColorByHexString("#1976d2");
	    window.plugins.headerColor.tint("#2196f3");
	} else {
	    StatusBar.backgroundColorByHexString("#2196f3");
	}
	$('#navbar').css('display', 'initial');
	$('#content-zone').css('margin-top', '75px');
	if (returnscreen === undefined) {
	    returnscreen = "home";
	    _returnscreen = null;
	} else {
	    _returnscreen = returnscreen;
	}
	navbar.fadeOut(150, function () {
	    switch (type) {
		case "home":
		    navbar.html('<span class="navbar-brand" style="color: white;">Business</span><span class="navbar-brand pull-right"><span onclick="openscreen(\'mobilecode\', \'FADE\')"><img src="icons/ic_lock.svg" alt="" /></span> &nbsp; <span onclick="openscreen(\'otp\', \'FADE\')"><img src="icons/ic_vpn_key.svg" alt="" /></span> &nbsp; <span onclick="openscreen(\'settings\', \'FADE\')"><img src="icons/ic_settings.svg" alt="" /></span></span>');
		    break;
		case "setup":
		    navbar.html('<span class="navbar-brand" style="color: white;">Business</span><span class="navbar-brand pull-right"><span onclick="openscreen(\'otp\', \'FADE\')"><img src="icons/ic_vpn_key.svg" alt="" /></span> &nbsp; <span onclick="openscreen(\'settings\', \'FADE\')"><img src="icons/ic_settings.svg" alt="" /></span></span>');
		    break;
		case "settings":
		    navbar.html('<span class="navbar-brand pull-left" style="color: white;" onclick="openscreen(\'home\', \'FADE\')"><img src="icons/ic_arrow-back.svg" /></span><span class="navbar-brand navbar-title" style="color: white;" onclick="openscreen(\'home\', \'FADE\')">Settings</span>');
		    break;
		case "otp":
		    navbar.html('<span class="navbar-brand pull-left" style="color: white;" onclick="openscreen(\'home\', \'FADE\')"><img src="icons/ic_arrow-back.svg" /></span><span class="navbar-brand navbar-title" style="color: white;" onclick="openscreen(\'home\', \'FADE\')">Auth Keys</span><span class="navbar-brand pull-right" onclick="openscreen(\'addotp\', \'FADE\')"><img src="icons/ic_add.svg" alt="" /></span>');
		    break;
		case "app":
		    navbar.html('<span class="navbar-brand pull-left" style="color: white;" onclick="openscreen(\'' + returnscreen + '\', \'FADE\')"><img src="icons/ic_arrow-back.svg" /></span><span class="navbar-brand navbar-title" style="color: white;" onclick="openscreen(\'' + returnscreen + '\', \'FADE\')">' + title + '</span>');
		    break;
		default:
		    navbar.html('<span class="navbar-brand" style="color: white;">Business</span>');
	    }
	    navbar.fadeIn(150);
	});
    }
}

/**
 * Load the app.html view and open an app with native Android UI elements
 * @param String id Application ID
 * @param String api Path to the mobile API
 * @param String url Base URL of the app
 * @param String icon URL to the app icon
 * @param String title Friendly app name
 * @param boolean injectcode (optional, default true) Whether or not to inject UI modification code into the app
 * @param boolean shownavbar (optional, default false) Whether or not to show the navbar at the top of the screen.
 * @returns {undefined}
 */
function openapp(id, api, url, icon, title, injectcode, shownavbar) {
    $('#content-zone').fadeOut(300, function () {
	$('#content-zone').load("views/app.html", function () {
	    $('#content-zone').fadeIn(300, function () {
		launchapp(id, api, url, icon, title, injectcode, shownavbar);
	    });
	});
    });
}

/**
 * Opens a modal dialog over the top of everything else.
 * @param {String} filename screens/[filename].html
 * @param {String} modalselector [#id-of-the-modal]
 * @returns {undefined}
 */
function openmodal(filename, modalselector) {
    $('#modal-load-box').load("views/" + filename + ".html", null, function (x) {
	$(modalselector).css('z-index', 9999999);
	$(modalselector).modal('show');
    });
}

/**
 * Close a modal (see openmodal)
 * @param {String} modalselector
 * @returns {undefined}
 */
function closemodal(modalselector) {
    $(modalselector).modal(hide);
}

function restartApplication() {
    navigator.splashscreen.show();
    // We're doing the timeout so we don't run afoul of server-side rate limiting
    setTimeout(function () {
	window.location = "index.html";
    }, 3000);
}

// Handle back button to close things
document.addEventListener("backbutton", function (event) {
    if (localStorage.getItem("setupcomplete")) {
	if ($("#appframe").length && historyctr > 0) {
	    console.log("going back");
	    var iframe = document.getElementById("appframe");
	    iframe.contentWindow.postMessage("goback", "*");
	    historyctr--;
	} else if (_returnscreen != null) {
	    openscreen(_returnscreen, "FADE");
	    _returnscreen = null;
	} else {
	    openscreen("home", "FADE");
	}
    } else {
	if (_returnscreen != null) {
	    openscreen(_returnscreen, "FADE");
	    _returnscreen = null;
	}
    }
}, false);