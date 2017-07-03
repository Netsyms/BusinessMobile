userinfo = null;
$(document).ready(function () {
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
});

document.addEventListener("deviceready", function () {
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#1976d2");
    }
}, false);

/**
 * Fetch user info (name, email, etc) from the server and save to the global 
 * variable `userinfo`.
 * @param function callback An optional function to run if/when the request 
 * succeeds.
 */
function getuserinfo(callback) {
    $.post(localStorage.getItem("portalurl"), {
        username: localStorage.getItem("username"),
        key: localStorage.getItem("key"),
        password: localStorage.getItem("password"),
        action: "user_info"
    }, function (data) {
        if (data.status === 'OK') {
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
        $('#content-zone').fadeOut('slow', function () {
            $('#content-zone').load("views/" + screenname + ".html", function () {
                $('#content-zone').fadeIn('slow');
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
 * @returns {undefined}
 */
function setnavbar(type, title) {
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
        switch (type) {
            case "home":
                navbar.html('<span class="navbar-brand" style="color: white;">Business</span><span class="navbar-brand pull-right" onclick="openscreen(\'settings\')"><img src="icons/ic_settings.svg" alt="" /></span>');
                break;
            case "settings":
                navbar.html('<span class="navbar-brand pull-left" style="color: white;" onclick="openscreen(\'home\')"><img src="icons/ic_arrow-back.svg" /></span><span class="navbar-brand" style="color: white;" onclick="openscreen(\'home\')">Settings</span>');
                break;
            case "app":
                navbar.html('<span class="navbar-brand pull-left" style="color: white;" onclick="openscreen(\'home\')"><img src="icons/ic_arrow-back.svg" /></span><span class="navbar-brand" style="color: white;" onclick="openscreen(\'home\')">' + title + '</span>');
                break;
            default:
                navbar.html('<span class="navbar-brand" style="color: white;">Business</span>');
        }
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
    $('#content-zone').load("views/app.html", function () {
        launchapp(id, api, url, icon, title, injectcode, shownavbar);
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

// Handle back button to close things
document.addEventListener("backbutton", function (event) {
    if (localStorage.getItem("setupcomplete")) {
        openscreen("home");
    }
}, false);