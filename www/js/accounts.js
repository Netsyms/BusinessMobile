/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

userinfo = null;
theme = {"title": "Business", "color": "#ffffff", "bgcolor": ""};
accountid = 0;

/**
 * Check if the accounts configuration seems valid.
 * @returns {Boolean} true if valid, otherwise false
 */
function isconfigvalid() {
    if (localStorage.getItem("accounts") !== null) {
        if (JSON.parse(localStorage.getItem("accounts")).length > 0) {
            return true;
        }
    }
    return false;
}

function getaccounts() {
    if (isconfigvalid()) {
        return JSON.parse(localStorage.getItem("accounts"));
    }
    return [];
}

function saveaccounts(accounts) {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

/**
 * Switch to a different account.
 * @param {int} account The selected account index from localStorage.getItem('accounts')
 * @returns {undefined}
 */
function switchaccount(account) {
    // If there isn't an accounts list yet, this shouldi take us back to the setup
    if (!isconfigvalid()) {
        restartApplication();
    }
    var accounts = getaccounts();
    // Selected account doesn't exist, choose the first one instead
    if (typeof accounts[account] === 'undefined') {
        account = 0;
    }
    var accountinfo = accounts[account];
    localStorage.setItem("username", accountinfo['username']);
    localStorage.setItem("password", accountinfo['password']);
    localStorage.setItem("syncurl", accountinfo['syncurl']);
    localStorage.setItem("key", accountinfo['key']);
    accountid = account;
}

/**
 * Add a Business Apps account.
 * @param {String} username
 * @param {String} password
 * @param {String} url
 * @param {String} key
 * @returns {Number} The index of the new account
 */
function addaccount(username, password, url, key) {
    var accounts = getaccounts();
    accounts.push({"username": username, "password": password, "syncurl": url, "key": key});
    saveaccounts(accounts);
    return accounts.length - 1;
}

/**
 * Remove a Business Apps account.
 * @param {Number} Account index
 */
function rmaccount(id) {
    var accounts = getaccounts();
    accounts.splice(id, 1);
    saveaccounts(accounts);
    if (id == accountid) {
        switchaccount(0);
    }
}

/**
 * Fetch user info (name, email, etc) from the server and save to the global
 * variable `userinfo`.
 * @param function callback An optional function to run if/when the request
 * succeeds.
 */
function getuserinfo(callback) {
    $(".loading-text").text("Loading account...");
    if (localStorage.getItem("username") === null
            || localStorage.getItem("password") === null
            || localStorage.getItem("syncurl") === null
            || localStorage.getItem("key") === null) {
        switchaccount(0);
    }
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
 * Set a new password for the current account
 * @param {String} newpass
 * @returns {undefined}
 */
function passwd(newpass) {
    var accounts = getaccounts();
    accounts[accountid]["password"] = newpass;
    saveaccounts(accounts);
}