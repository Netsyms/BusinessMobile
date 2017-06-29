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

function getuserinfo(callback) {
    $.post(localStorage.getItem("portalurl"), {
        username: localStorage.getItem("username"),
        key: localStorage.getItem("key"),
        password: localStorage.getItem("password"),
        action: "user_info"
    }, function (data) {
        if (data.status === 'OK') {
            userinfo = data.info;
            callback();
        } else {
            navigator.notification.alert(data.msg, null, "Error", 'Dismiss');
        }
    }, "json").fail(function () {
        navigator.notification.alert("Could not connect to the server.  Try again later.", null, "Error", 'Dismiss');
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
    updateStatusBarColor();
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