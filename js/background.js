var unreadCount = -1;
var curemail = null;
var socket = null;
var setuping = false;
var channelToken = null;
var login = false;
var online = false;
var setupChannelConTask = null;
var access_token = null;
var userId = null;

const AUTH_URL = "http://localhost:4200/";
const HOST = "http://localhost:4200";
const notLoginIcon = "/images/notlogin.png";
const loginIcon = "/images/login.png";

function init() {
  log("init");
  const options = {};
  options.debug = true;

  chrome.storage.sync.get("access_token", (result) => {
    // console.log('Value currently is ' + result.access_token);
    // Object.assign(options, result.options);
    access_token = result.access_token;
    console.log(access_token);
    if (access_token != null && access_token != "") {
      login = true;
      online = true;
      normal();
      updateIcon();
    } else {
      {
        chrome.tabs.create({
          url: AUTH_URL,
          active: false,
        });
      }
    }
    // optionsForm.debug.checked = Boolean(options.debug);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  if (request.action == "login") {
    checkLoginStatus(request.access_token);
  }

  if (request.action == "logoff") {
    logoff();
  }

  if (request.action == "show") {
    chrome.tabs.sendMessage(sender.tab.id, request, callback);
  }

  if (request.action == "hide") {
    chrome.tabs.sendMessage(sender.tab.id, request, callback);
  }

  // if (request.action == 'urlinfo')
  // {
  //  chrome.tabs.sendMessage(sender.tab.tab.id, request, callback);

  //  currentTabUrl=sender.tab.url;
  //  currentTabTitle=sender.tab.title;
  //  currentTabIcon=sender.tab.icon;
  // }
});

function checkLoginStatus(access_token) {
  if (access_token != null && access_token != "") {
    login = true;
    online = true;
    chrome.storage.sync.set({ access_token: access_token });
    normal();
    updateIcon();
  } else {
    logoff();
    setbuttonplslogin();
    updateIcon();
  }
}

function log(str) {
  console.log(getCurLocalTime() + " - " + str);
}

function getCurLocalTime() {
  var d = new Date();

  // var sendtime = d.format("yyyy-MM-dd hh:mm:ss");
  var sendtime = d.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return sendtime;
}

log("background page");

restore_options();
init();

function restore_options() {
  // if (localStorage["maxtabnumber"] == null)
  //   localStorage["maxtabnumber"] = MAXTABNUMBER;
  // var enableCommentBtn;
  // if (localStorage["enableCommentBtn"])
  //   enableCommentBtn = toBool(localStorage["enableCommentBtn"]);
  // else {
  //   enableCommentBtn = ENABLECOMMENTBTN;
  //   localStorage["enableCommentBtn"] = enableCommentBtn;
  // }
  // chrome.storage.local.set({ enableCommentBtn: enableCommentBtn }, function () {
  //   console.log("chrome storge local set enableCommentBtn");
  // });
  // if (localStorage["tome"] == null) localStorage["tome"] = TOME;
  // if (localStorage["toall"] == null) localStorage["toall"] = TOALL;
}

function updateIcon() {
  log("updateIcon");

  if (login) {
    if (online) {
      chrome.action.setIcon({ path: loginIcon });
      chrome.action.setBadgeBackgroundColor({
        color: [208, 0, 24, 255],
      });
      if (unreadCount > 0) {
        chrome.action.setBadgeText({ text: unreadCount.toString() });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    } else {
      chrome.action.setIcon({ path: notLoginIcon });
      chrome.action.setBadgeBackgroundColor({
        color: [190, 190, 190, 230],
      });
      chrome.action.setBadgeText({ text: "" });
    }
  } else {
    chrome.action.setIcon({ path: notLoginIcon });
    chrome.action.setBadgeBackgroundColor({
      color: [190, 190, 190, 230],
    });
    chrome.action.setBadgeText({ text: "?" });
  }
}

function setOfflineIcon() {
  log("setOfflineIcon");
  online = false;
  updateIcon();
}

chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request) {
    if (request.message) {
      if (request.message == "version") {
        sendResponse({ version: 3.0 });
      }
    }
  }
  return true;
});

var currentTabUrl;
var currentTabTitle;
var currentTabIcon;

function logoff() {
  log("background page log off");
  unreadCount = -1;
  curemail = null;
  // localStorage.removeItem("groups");

  chrome.storage.local.removeItem("groups", function () {
    console.log("chrome storge local remove groups");
  });

  login = false;
  // closeFirebaseChannel();
  updateIcon();
}

function setbuttonsend() {
  setbuttonnone();
  chrome.action.onClicked.addListener(send);
}

function setbuttonplslogin() {
  setbuttonnone();
  chrome.action.onClicked.addListener(plslogin);
}

function setBtnMsgPage() {
  setbuttonnone();
  chrome.action.onClicked.addListener(redirectUnreadMsgPage);
}

function setbuttonnone() {
  chrome.action.onClicked.removeListener(send);
  chrome.action.onClicked.removeListener(plslogin);
}

function plslogin() {
  log("pls login");

  chrome.tabs.create({
    url: AUTH_URL,
    active: true,
  });

  unreadCount = -1;
  updateIcon();
  log("login page");
}

function redirectUnreadMsgPage() {
  log("redirect to unread msg page");
  chrome.tabs.create({ url: msgPageUrl }, null);
}

function normal() {
  if (navigator.onLine == true) {
    log("normal");
    // getMsgs();
    getUnreadMsgCount();
    // getGroups();
    setupFirebaseChannel();
    getUserInfo();
    setbuttonsend();
  } else {
    FirebaseOnChannelErrHandler();
  }
  updateIcon();
}

function getUnreadMsgCount() {
  log("getUnreadMsgCount");
  const myHeaders = new Headers();
  myHeaders.append("Authorization", access_token);

  fetch(HOST + "/api/messages/unreadnum", { headers: myHeaders })
    .then((r) => r.json())
    .then((result) => {
      if (result) {
        unreadCount = parseInt(result.data);
        updateIcon();
      }
    });
}

function getMsgs() {
  log("getMsgs");
  $.ajax({
    type: "get",
    url: host + "/api/favurl/pending",
    dataType: "json",
    success: function (data) {
      if (data) extractJson(data);
    },
  });

  headers = new Headers([["Authorization", access_token]]);

  fetch(HOST + "/api/favurl/pending", { headers })
    .then((r) => r.text())
    .then((result) => {
      // Result now contains the response text, do what you want...
    });
}

function extractJson(data) {
  // var maxnumber = localStorage["maxtabnumber"];
  var maxnumber = chrome.storage.sync.get("maxtabnumber");
  var maxnumber = 20;

  var favurlshows = data.FavURLShows;

  chrome.tabs.query(
    { windowId: chrome.windows.WINDOW_ID_CURRENT },
    function (tabs) {
      var initcurtabnumber = tabs.length;
      var sid = 0;
      var channel = "WEB";
      var i = 0;

      for (j in favurlshows) {
        log("j: " + j);
        log("i: " + i);

        curtabnumber = initcurtabnumber + i;
        log("check tab number: " + curtabnumber);
        if (curtabnumber < maxnumber) {
          channel = "CHROME";
        }
        log("channel: " + channel);

        sid = favurlshows[j].id;
        updateChannel(sid, channel);

        log("favurl msg: " + sid);

        i = i + 1;
      }
    }
  );
}

function updateChannel(sid, channel) {
  log("updateChannel sid=" + sid);
  log("updateChannel channel=" + channel);

  $.ajax({
    type: "post",
    data: {
      id: sid,
      channel: channel,
    },
    url: host + "/api/favurl/channel",
    dataType: "json",
    success: function (json) {
      if (json) {
        json = json.FavURLNotify;
        var nickname = json.nickname;
        var surl = json.url;
        var sendtime = getLocalSendTime(json.sendtime);
        sendtime = jQuery.timeago(sendtime);
        var avatarurl = json.avatarURL;

        if (avatarurl == null) avatarurl = host + "/images/mystery-man.jpg";

        var userid = json.fromid;

        log("updatehandler");

        chrome.tabs.create(
          {
            url: surl,
            active: false,
          },
          function (tab) {
            chrome.tabs.executeScript(
              tab.id,
              {
                file: "js/ReceiveMSG.js",
              },
              function () {
                chrome.tabs.sendMessage(tab.id, {
                  status: "success",
                  nickname: nickname,
                  sendtime: sendtime,
                  avatarurl: avatarurl,
                  userid: userid,
                });
              }
            );
          }
        );

        log("tab created");
      }
    },
  });
}

function getLocalSendTime(sendtime) {
  var d = new Date(sendtime);
  var sendtime = d.format("yyyy-MM-dd hh:mm:ss");
  return sendtime;
}

function getFirebaseChannelToken() {
  log("getFirebaseChannelToken");

  const myHeaders = new Headers();
  myHeaders.append("Authorization", access_token);

  fetch(HOST + "/api/services/channel", { headers: myHeaders })
    .then((r) => r.text())
    .then((result) => {
      if (result) {
        channelToken = result;

        chrome.storage.sync.set({ channelToken: channelToken });

        setupFirebaseChannelCon();
      }
    });
}

// import { initializeApp, setLogLevel } from "/firebase/firebase-app.js";
// import { getAuth, signInWithCustomToken } from "/firebase/firebase-auth.js";
// import { getDatabase, ref, onValue } from "/firebase/firebase-database.js";
// var firebase;

self.importScripts(
  "/firebase/firebase-app-8.js",
  "/firebase/firebase-auth-8.js",
  "/firebase/firebase-database-8.js"
);
// initFirebase();
function initFirebase8() {
  const firebaseConfig = {
    apiKey: "AIzaSyBjTrt683TsU0iiUsqCUQQerSZlY6prVY8",
    authDomain: "tsahayluapp.firebaseapp.com",
    databaseURL: "https://tsahayluapp.firebaseio.com",
    projectId: "tsahayluapp",
    storageBucket: "tsahayluapp.appspot.com",
    messagingSenderId: "920446357904",
    appId: "1:920446357904:web:a386380b319fd7b34e6315",
    measurementId: "G-ML9C67840E",
  };

  firebase.initializeApp(firebaseConfig);
  // firebase.enableLogging(true);
} // Initialize Firebase

function initFirebase() {
  /*   const firebaseConfig = {
    apiKey: "AIzaSyBjTrt683TsU0iiUsqCUQQerSZlY6prVY8",
    authDomain: "tsahayluapp.firebaseapp.com",
    databaseURL: "https://tsahayluapp.firebaseio.com",
    projectId: "tsahayluapp",
    storageBucket: "tsahayluapp.appspot.com",
    messagingSenderId: "920446357904",
    appId: "1:920446357904:web:a386380b319fd7b34e6315",
    measurementId: "G-ML9C67840E",
  };

  firebase = initializeApp(firebaseConfig);
 */
  const firebaseConfig = {
    apiKey: "AIzaSyBjTrt683TsU0iiUsqCUQQerSZlY6prVY8",
    authDomain: "tsahayluapp.firebaseapp.com",
    databaseURL: "https://tsahayluapp.firebaseio.com",
    projectId: "tsahayluapp",
    storageBucket: "tsahayluapp.appspot.com",
    messagingSenderId: "920446357904",
    appId: "1:920446357904:web:a386380b319fd7b34e6315",
    measurementId: "G-ML9C67840E",
  };

  setLogLevel("debug");
  const app = initializeApp(firebaseConfig);
  console.log("initializeApp");

  const auth = getAuth(app);
  const channelToken =
    "eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImNsYWltcyI6eyJzaWdudXB0aW1lIjp7fX0sImV4cCI6MTY2NjQ5OTU1NCwiaWF0IjoxNjY2NDk1OTU0LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay02MDRma0B0c2FoYXlsdWFwcC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLTYwNGZrQHRzYWhheWx1YXBwLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiNTAwMSJ9.gHM1FRgii0ABi384RzqtewUT6PvLxY71yoqkIl1YyCZMU_MTtK18ohVkqDw1FtTudsfpZcXx2N9HGiDfYuNHVwI6S-s7RgFo2C5i6zlNF2NzuOuNJuzjXgbxaHbQIhdrQiDaFyz8hVOtzGYRlVeRdAYiv-F0DnRvgtvAd4iyd4V4tmBI5mLQlSyS8F1hjwrDOq-bk_XIo8lGtmleKycfM2nskR-sHN2uJGgBOS1WJP5w-Mz2Y6GQOO8F7v2gPRXPiJ9J-OuwDhcCGW-xJ5NC6ursiwerjD7mSLukmDShAsGkpdoToN6mqXsS6P1CjJYS9RZ2Zzf6GqFZiMa-QcBo9A";
  signInWithCustomToken(auth, channelToken)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      console.log(error);
      const errorMessage = error.message;
      // ...
    });

  const database = getDatabase(app);
  const FirebaseChannel = ref(database, "channels/5001");
  onValue(FirebaseChannel, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
  });

  // firebase.enableLogging(true);
} // Initialize Firebase

var FirebaseChannel = null;

function setupFirebaseChannelCon() {
  log("setupFirebaseChannelCon");

  if (!channelOpened) {
    if (!setuping) {
      setuping = true;
      // isGoogleCon = false;
      // var  channel = new goog.appengine.Channel(channelToken);

      firebase
        .auth()
        .signInWithCustomToken(channelToken)
        .catch(function (error) {
          console.log("Login Failed!", error.code);
          console.log("Error message: ", error.message);
          // localStorage.removeItem("channelToken");

          // chrome.storage.local.removeItem("channelToken", function () {
          //   console.log("chrome storge local remove channelToken");
          // });

          channelToken = null;
          chrome.storage.sync.set({ channelToken: channelToken });

          setuping = false;
          isErrProcessing = false;
          FirebaseOnChannelErrHandler();
        });

      FirebaseChannel = firebase.database().ref("channels/" + userId);

      // add a listener to the path that fires any time the value of the data changes
      // socket = channel.open();
      // socket.onopen = channelonOpened;
      // socket.onmessage = channelonMessage;
      FirebaseChannel.on("value", function (data) {
        if (data.val() != null) {
          FirebasechannelonMessage(data.val());
        }
      });

      // socket.onerror = channelonError;
      // socket.onclose = channelonClose;
    }
  }
}

function initPingGoogle() {
  log("initPingGoogle");

  $.ajax({
    url: talkgadgeturl,
    type: "GET",
    datatype: "text/html",
    timeout: 1500,
    complete: function (e, xhr, settings) {
      if (e.status === 401) {
        isGoogleCon = true;
        getFirebaseChannelToken();
        // setupChannelConTask = setInterval(setupFirebaseChannelCon(), 10000);
        setbuttonsend();
      } else {
        online = false;
        setOfflineIcon();
        setNotifyPopup("discongoogle.html");
        googleCheck = setInterval(tryPingGoogle, 10000);
      }
    },
  });
}

function setupFirebaseChannel() {
  log("setupFirebaseChannel");

  initFirebase8();
  getFirebaseChannelToken();
  // initPingGoogle();
  /*    if (isGoogleCon) {
            channelOpened = false;
            setupChannelConTask = setInterval(setupFirebaseChannelCon(), 10000);
            setbuttonsend();
        } else {
            setOfflineIcon();
            setNotifyPopup("discongoogle.html");
            googleCheck = setInterval(connectGoogle, 10000);
        }*/
}

function tryPingGoogle() {
  log("tryPingGoogle");

  $.ajax({
    url: talkgadgeturl,
    type: "GET",
    datatype: "text/html",
    timeout: 1500,
    statusCode: {
      401: function () {
        isGoogleCon = true;
        clearInterval(googleCheck);
        removePopup();
        getFirebaseChannelToken();
        // setupChannelConTask = setInterval(setupFirebaseChannelCon(), 10000);

        online = true;
        setbuttonsend();
        getMsgs();
        getUnreadMsgCount();
        updateIcon();
      },
    },
  });
}

var conCheck;

function reConnect() {
  log("retry connect");
  if (window.navigator.onLine == true) {
    clearInterval(conCheck);
    removePopup();

    online = true;
    getMsgs();
    getUnreadMsgCount();
    updateIcon();
    setupFirebaseChannel();
    isErrProcessing = false;
  }
}

var channelOpened = false;

function FirebasechannelonOpened() {
  log("Firebasechannel opened");
  channelOpened = true;
  setuping = false;
  isErrProcessing = false;
  isGoogleCon = false;
}

function FirebasechannelonMessage(msg) {
  // var msg=JSON.parse(msg.data);
  var FavURLShows = msg.FavURLShows;
  var msgnum = msg.MsgNum;
  var newgroups = msg.Groups;

  if (FavURLDtoList) {
    log("channel msg: FavURLs");
    extractJson(msg);
  } else {
    if (msgnum) {
      log("channel msg: MsgNum");
      unreadCount = msgnum.num;
      updateIcon();
    } else {
      if (newgroups) {
        log("channel msg: Groups");
        saveGroups(newgroups);
      }
    }
  }
}

var isErrProcessing = false;

function FirebaseChannelOnError(err) {
  setuping = false;
  if (login) {
    log("channel error code: " + err.code);
    var code = err.code;

    if (code == 401 || code == 500) {
      // localStorage.removeItem("channelToken");

      chrome.storage.local.removeItem("channelToken", function () {
        console.log("chrome storge local remove channelToken");
      });
    }

    FirebaseOnChannelErrHandler();
  } else {
    // localStorage.removeItem("channelToken");
    chrome.storage.local.removeItem("channelToken", function () {
      console.log("chrome storge local remove channelToken");
    });
  }
}

function FirebaseChannelOnClose() {
  setuping = false;
  log("channel closed");
}

function FirebaseOnChannelErrHandler() {
  if (!isErrProcessing) {
    isErrProcessing = true;
    if (window.navigator.onLine == true) {
      log("channel setup error");
      closeFirebaseChannel();
      setupFirebaseChannel();
    } else {
      log("network disconnect");
      setOfflineIcon();
      closeFirebaseChannel();
      setNotifyPopup("disconnect.html");
      conCheck = setInterval(reConnect, 10000);
    }
  }
}

var googleCheck;

function setNotifyPopup(page) {
  log("setNotifyPopup");
  setbuttonnone();
  chrome.tabs.query({}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      tab = tabs[i];
      chrome.action.setPopup({
        tabId: tab.id,
        popup: page,
      });

      chrome.tabs.update(tab.id, {});
    }
  });
}

function removePopup() {
  log("removePopup");

  chrome.tabs.query({}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      tab = tabs[i];
      chrome.action.setPopup({
        tabId: tab.id,
        popup: "",
      });

      chrome.tabs.update(tab.id, {});
    }
  });
}

var isGoogleCon = false;

function closeFirebaseChannel() {
  log("closeFirebaseChannel");

  /*  if(socket)
      {
          socket.close();  
      }*/
}

var hasfriend = false;

function checkFriends() {
  log("checkFriends");

  $.ajax({
    type: "get",
    url: host + "/api/friend/available",
    dataType: "text",
    // async: false,
    success: function (data) {
      if (data) {
        if (data === "true") {
          hasfriend = true;
        }

        if (data === "false") {
          hasfriend = false;
        }
      }
    },
  });
}

var friends_num = 0;

function getSendGroups() {
  log("getSendGroups");
  friends_num = 0;
  // var groupsstring = localStorage["groups"];

  chrome.storage.local.get("groups", function (result) {
    var groupsstring = result["groups"];
  });

  if (groupsstring != null) {
    var groups = JSON.parse(groupsstring);

    var sendgroupids = "";
    j = 0;

    for (var i = 0; i < groups.length; i++) {
      var id = groups[i].id;
      var status = groups[i].status;
      if (status == 3) {
        sendgroupids = sendgroupids + id + "|";
        j = j + 1;
        friends_num = friends_num + groups[i].num;
      }
    }

    return sendgroupids;
  }

  return null;
}

function isValidURL(s) {
  return /^https?\:/i.test(s);
}

function send(tab) {
  log("send");
  if (navigator.onLine == true) {
    var surl = tab.url;
    if (isValidURL(surl)) {
      var tabid = tab.id;
      var sendgroupids = undefined;
      var surltitle = tab.title;
      var siconurl = tab.favIconUrl;

      // chrome.storage.local.get("toall", function (result) {
      //   var toall = toBool(result["toall"]);
      // });

      // var toall = toBool(localStorage["toall"]);
      var hasSentFriends = false;

      // if (!toall) {
      //   sendgroupids = getSendGroups();
      //   if (friends_num > 0) {
      //     hasSentFriends = true;
      //   }
      // }

      // if (toall) {
      //   checkFriends();
      //   if (hasfriend) hasSentFriends = true;
      // }

      // var tome = toBool(localStorage["tome"]);
      // chrome.storage.local.get("tome", function (result) {
      //   var tome = toBool(result["tome"]);
      // });

      // if (tome) hasSentFriends = true;

      chrome.scripting.executeScript(
        {
          target: { tabId: tabid },
          files: ["js/SendMSG.js"],
        },
        function () {
          // if (!hasSentFriends) {
          //   if (toall) {
          //     chrome.tabs.sendMessage(tabid, { status: "noFriends" });
          //   } else {
          //     if (sendgroupids.length > 0)
          //       chrome.tabs.sendMessage(tabid, { status: "noFriendsInGroup" });
          //     else
          //       chrome.tabs.sendMessage(tabid, { status: "noGroupSelected" });
          //   }
          // } else {
          sendURLRequest(
            true,
            false,
            sendgroupids,
            surl,
            tabid,
            surltitle,
            siconurl
          );
          // }
        }
      );
    } else {
      chrome.tabs.create({ url: "options.html" });
    }
  } else {
    disConnectHandler();
  }
}

function sendURLRequest(tome, toall, groupids, surl, tabid, urltitle, iconurl) {
  log("sendURLRequest");
  /*  $.ajax({
      type: "post",
      data: {
        tome: tome,
        toall: toall,
        groupids: groupids,
        url: surl,
        tabid: tabid,
        urltitle: urltitle,
        iconurl: iconurl,
      },
      url: host + "/api/favurls/send",
      datatype: "text",
      statusCode: {
        404: function () {
          chrome.tabs.sendMessage(tabid, { status: "notFound" });
        },
        406: function () {
          chrome.tabs.sendMessage(tabid, { status: "notFound" });
        },
      },
      success: function (data) {
        var tabid = parseInt(data);
        log("send done:" + tabid);
        chrome.tabs.sendMessage(tabid, { status: "sentsuccess" });
      },
    });
  } */

  const myHeaders = new Headers();
  myHeaders.append("Authorization", access_token);

  const params = {
    fromId: 5001,
    toMe: true,
    toAll: false,
    groupIds: 0,
    url: surl,
    groupIds: groupids,
    urlTitle: urltitle,
    iconUrl: iconurl,
  };

  var url = new URL(HOST + "/api/favurls/send");

  url.search = new URLSearchParams(params).toString();

  fetch(url, { method: "POST", headers: myHeaders })
    .then((r) => r.json())
    .then((result) => {
      if (result) {
        chrome.tabs.sendMessage(tabid, { status: "sentsuccess" });
      }
    });
}

function getUserInfo() {
  log("getuserinfo");
  /*   $.ajax({
    type: "GET",
    url: host + "/api/user",
    dataType: "JSON",
    success: function (data) {
      var userinfo = data.user;
      // localStorage["email"] = userinfo.email;

      chrome.storage.local.set({ email: userinfo.email }, function () {
        console.log("chrome storge local set email");
      });

      // localStorage["nickname"] = userinfo.nickname;
      // localStorage["id"] = userinfo.id;
      // localStorage["emailSubscription"] = userinfo.emailSubscription;
      // localStorage["favurlSubscription"] = userinfo.favurlSubscription;

      // chrome.storage.local.set(

      var avatarURL = userinfo.avatarURL;
      if (avatarURL == null) avatarURL = host + "/images/mystery-man.jpg";

      // localStorage["avatarURL"] = avatarURL;
    },
  }); */

  log("getuserinfo");
  const myHeaders = new Headers();
  myHeaders.append("Authorization", access_token);

  fetch(HOST + "/api/user/basic", { headers: myHeaders })
    .then((r) => r.json())
    .then((result) => {
      if (result) {
        var userinfo = result.data;

        chrome.storage.sync.set({ userId: userinfo.id });
        userId = userinfo.id;

        var avatarURL = userinfo.avatarURL;
        if (avatarURL == null) avatarURL = host + "/images/mystery-man.jpg";
      }
    });
}
