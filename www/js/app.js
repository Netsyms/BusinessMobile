/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

userinfo = null;

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
 * Add button to the top navbar.
 * @param String screenid openscreen(screenid)
 * @param String icon The filename of the icon to show: <img src="icons/icon"...
 * @param String title Text to show next to the icon on large screens.
 * @returns {undefined}
 */
function addnavbarbtn(screenid, icon, title) {
    $('#navbar-buttons').append('<li><a onclick="openscreen(\'' + screenid + '\', \'FADE\')"><img src="icons/' + icon + '" alt="" /> <span class="hidden-xs">' + title + '</span></a></li>');
}

/**
 * Set the navbar options.
 *
 * @param String title Text to display
 * @param boolean showarrow True if the back arrow should be visible
 * @param Stringn backscreen The screen to open when the title is pressed, false or null for none
 * @returns {undefined}
 */
function setnavbartitle(title, showarrow, backscreen) {
    var arrow = "";
    if (showarrow === true) {
        arrow = '<img src="icons/ic_arrow-back.svg" />';
    }
    var onclick = "";
    if (backscreen !== null && backscreen !== false) {
        onclick = ' onclick=\'openscreen("' + backscreen + '", "FADE");\'';
    }
    $("#navbar-header").html('<span class="navbar-brand" id="navbar-title" style="color: white;"' + onclick + '>' + arrow + title + '</span>');
}

/**
 * Set the navbar.
 * @param String,boolean type false if no navbar, "home" for the home screen,
 * "settings" for settings, "app" for a custom title, or anything else for
 * a simple one.
 * @param String screentitle The title to show if type == "app"
 * @param String returnscreen Where to go back to.  Defaults to "home".
 * @returns {undefined}
 */
function setnavbar(type, screentitle, returnscreen) {
    var navbar = $('#navbar-header');
    var btns = $('#navbar-buttons');
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
        btns.html("");
        switch (type) {
            case "home":
                setnavbartitle("Business", false, false);
                addnavbarbtn("mobilecode", "ic_desktop_windows.svg", "Code Login");
                addnavbarbtn("otp", "ic_vpn_key.svg", "2-factor Auth");
                addnavbarbtn("settings", "ic_settings.svg", "Settings");
                break;
            case "setup":
                setnavbartitle("Business", false, false);
                addnavbarbtn("otp", "ic_vpn_key.svg", "2-factor Auth");
                addnavbarbtn("settings", "ic_settings.svg", "Settings");
                break;
            case "settings":
                setnavbartitle("Settings", true, "home");
                break;
            case "otp":
                setnavbartitle("Auth Keys", true, "home");
                addnavbarbtn("addotp", "ic_add.svg", "Add Key");
                break;
            case "app":
                setnavbartitle(screentitle, true, returnscreen);
                break;
            default:
                setnavbartitle("Business", false, false);
                break;
        }
    }
}

/**
 * Thanks to https://stackoverflow.com/a/13542669
 * @param {type} color
 * @param {type} percent
 * @returns {String}
 */
function shadeColor2(color, percent) {
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
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
 * @param {String} filename views/[filename].html
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
    $(modalselector).modal('hide');
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