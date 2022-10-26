var unreadCount = -1;
var curemail = null;
var socket = null;
var setuping = false;
var channelToken = null;
var login = false;
var online = false;
var setupChannelConTask = null;
var access_token = null;
var refreshToken = null;
var userId = null;

const AUTH_URL = "http://localhost:4200/";
const HOST = "http://localhost:4200";
const notLoginIcon = "/images/notlogin.png";
const loginIcon = "/images/login.png";

const FAVURl_STATUS = {
  PENDING: 0,
  NEW: 1,
  PENDING: 0,
};

log("background page");

restore_options();
init();

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
      setbuttonplslogin();
    }
    // optionsForm.debug.checked = Boolean(options.debug);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  if (request.action == "login" && login == false) {
    checkLoginStatus(request);
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

function checkLoginStatus(request) {
  log("checkLoginStatus");

  access_token = request.access_token;
  refreshToken = request.refreshToken;
  log(request);
  if (access_token != null && access_token != "") {
    login = true;
    online = true;
    chrome.storage.sync.set({ access_token: access_token });
    chrome.storage.sync.set({ refreshToken: refreshToken });
    normal();
    updateIcon();
  } else {
    logoff();
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
  login = false;
  login = false;

  chrome.storage.sync.set({ refreshToken: null });
  chrome.storage.sync.set({ access_token: null });
  setbuttonplslogin();
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
    getPendingFavurl();
    getUnreadMsgCount();
    // getGroups();
    getUserInfo();
    setbuttonsend();
  } else {
    FirebaseOnChannelErrHandler();
  }
  updateIcon();
}

function getUnreadMsgCount() {
  log("getUnreadMsgCount");
  // const myHeaders = new Headers();
  // myHeaders.append("Authorization", access_token);
  var url = new URL(HOST + "/api/messages/unreadnum");

  customFetcher(url)
    .then((r) => r.json())
    .then((result) => {
      if (result) {
        unreadCount = parseInt(result.data);
        updateIcon();
      }
    });
}

function getPendingFavurl() {
  log("get pending favurl");

  // const myHeaders = new Headers();
  // myHeaders.append("Authorization", access_token);

  const params = {
    status: FAVURl_STATUS.PENDING,
    pageIndex: 0,
    pageSize: 100,
  };

  var url = new URL(HOST + "/api/favurls");

  url.search = new URLSearchParams(params).toString();

  customFetcher(url)
    .then((r) => r.json())
    .then((result) => {
      if (result.data)
        processFavURLDtoList(result.data.FavurlDtoList.map((x) => x.id));
    });
}

function processFavURLDtoList(favURLDtoList) {
  // var maxnumber = localStorage["maxtabnumber"];
  var maxnumber = chrome.storage.sync.get("maxtabnumber");
  var maxnumber = 20;

  chrome.tabs.query(
    { windowId: chrome.windows.WINDOW_ID_CURRENT },
    function (tabs) {
      var initcurtabnumber = tabs.length;
      var sid = 0;
      var channel = "WEB";
      var i = 0;

      for (favurlDto in favURLDtoList) {
        let id = favURLDtoList[favurlDto];

        log("id: " + id);
        log("i: " + i);

        curtabnumber = initcurtabnumber + i;
        log("check tab number: " + curtabnumber);
        if (curtabnumber < maxnumber) {
          channel = "CHROME";
        }
        log("channel: " + channel);

        updateChannel(id, channel);

        log("favurl msg: " + id);

        i = i + 1;
      }
    }
  );
}

function updateChannel(sid, channel) {
  log("updateChannel sid=" + sid);
  log("updateChannel channel=" + channel);

  /*   const myHeaders = new Headers();
  myHeaders.append("Authorization", access_token); */

  const params = {
    id: sid,
    channel: channel,
  };

  var url = new URL(HOST + "/api/favurls/channel");

  url.search = new URLSearchParams(params).toString();

  // fetch(url, { method: "PATCH", headers: myHeaders })
  customFetcher(url, { method: "PATCH" })
    .then((r) => r.json())
    .then((result) => {
      if (result.data) {
        favurl = result.data;
        var nickname = favurl.nickname;
        var surl = favurl.url;
        var sendtime = getLocalSendTime(favurl.sendtime);
        var avatarurl = favurl.avatarURL;

        if (avatarurl == null) avatarurl = HOST + "/images/mystery-man.jpg";

        var userid = favurl.fromid;

        log("updatehandler");

        chrome.tabs.create(
          {
            url: surl,
            active: false,
          },
          function (tab) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["js/ReceiveMSG.js"],
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
    });
}

function getLocalSendTime(sendtime) {
  var d = new Date(sendtime);
  var sendtime = d.toLocaleTimeString();

  return sendtime;
}

function getFirebaseChannelToken() {
  log("getFirebaseChannelToken");

  channelToken = chrome.storage.sync.set({ channelToken: channelToken });

  // const myHeaders = new Headers();
  // myHeaders.append("Authorization", access_token);
  var url = new URL(HOST + "/api/services/channel");

  customFetcher(url)
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

function setupFirebase() {
  log("setup Firebase ");

  initFirebase8();

  chrome.storage.sync.get("channelToken", (result) => {
    channelToken = result.channelToken;
    console.log(channelToken);
    if (channelToken != null && channelToken != "") {
      setupFirebaseChannelCon();
    } else {
      getFirebaseChannelToken();
    }
    // optionsForm.debug.checked = Boolean(options.debug);
  });

  // initPingGoogle();
  // if (isGoogleCon) {
  //   channelOpened = false;
  //   setupChannelConTask = setInterval(setupFirebaseChannelCon(), 10000);
  //   setbuttonsend();
  // } else {
  //   setOfflineIcon();
  //   setNotifyPopup("discongoogle.html");
  //   googleCheck = setInterval(connectGoogle, 10000);
  // }
}

self.importScripts(
  "/firebase/firebase-app-8.js",
  "/firebase/firebase-auth-8.js",
  "/firebase/firebase-database-8.js"
);

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

// initFirebase();
function initFirebase8() {
  if (firebase.apps.length < 1) {
    firebase.initializeApp(firebaseConfig);
  }
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

      firebase
        .auth()
        .signInWithCustomToken(channelToken)
        .then((userCredential) => {
          // Signed in
          var user = userCredential.user;
          FirebaseChannel = firebase.database().ref("channels/" + userId);
          FirebaseChannel.on("value", function (data) {
            if (data.val() != null) {
              FirebasechannelonMessage(data.val());
            }
          });
          channelOpened = true;
          console.log("firebase channel opened");
        })
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

      setuping = false;
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
        getPendingFavurl();
        getUnreadMsgCount();
        updateIcon();
      },
    },
  });
}

var conCheck;

function reConnect() {
  log("retry connect");
  if (navigator.onLine == true) {
    clearInterval(conCheck);
    removePopup();

    online = true;
    getPendingFavurl();
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
  var FavURLDtoList = msg.FavURLDtoList;
  var msgnum = msg.MsgNum;
  var newgroups = msg.Groups;

  if (FavURLDtoList) {
    log("channel msg: FavURLs");
    processFavURLDtoList(FavURLDtoList);
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
    if (navigator.onLine == true) {
      log("channel setup error");
      closeFirebaseChannel();
      getFirebaseChannelToken();
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

  // const myHeaders = new Headers();
  // myHeaders.append("Authorization", access_token);

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

  customFetcher(url, { method: "POST" })
    .then((r) => r.json())
    .then((result) => {
      if (result) {
        chrome.tabs.sendMessage(tabid, { status: "sentsuccess" });
      }
    })
    .catch((error) => {
      console.log("error", error);
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
  // const myHeaders = new Headers();
  // myHeaders.append("Authorization", access_token);

  var url = new URL(HOST + "/api/user/basic");

  customFetcher(url)
    .then((r) => r.json())
    .then((result) => {
      if (result) {
        var userinfo = result.data;

        chrome.storage.sync.set({ userId: userinfo.id });
        userId = userinfo.id;

        var avatarURL = userinfo.avatarURL;
        if (avatarURL == null) avatarURL = host + "/images/mystery-man.jpg";
        setupFirebase();
      }
    });
}

// const { fetch: originalFetch} = window;

// fetch = async (...args) => {
//   let [resource, config] = args;

//   // request interceptor starts

//   // request interceptor ends

//   const response = await originalFetch(resource, config);
//   if (response.status === 200) {
//     return response;
//   }

//   if (response.status === 401) {
//     // 401 error handling
//     unAuthorizeErrorHandling(resource, config);
//   }

//   // response interceptor here
// };

var isRefreshing = false;

// fetch = ((originalFetch) => {
//   return (...arguments) => {
//     let [resource, config] = arguments;
//     if (resource.origin === HOST) {
//       if (!config) {
//         config = {};
//       }
//       if (!config.headers) {
//         config.headers = {};
//       }
//       config.headers.Authorization = "Bearer " + access_token;
//       arguments[1] = config;
//     }
//     return originalFetch.apply(this, arguments).then(async (response) => {
//       if (response.status === 401) {
//         // 401 error handling
//         return unAuthorizeErrorHandling(response, arguments);
//       } else return response;
//     });
//   };
// })(fetch);

// async function unAuthorizeErrorHandling(oldResponse, oldAguments) {
//   console.log("401 UnAuthorize");
//   console.log("oldAguments", oldAguments);

//   await chrome.storage.sync.get("refreshToken", async function (result) {
//     refreshToken = result.refreshToken;
//     if (refreshToken && login == true) {
//       isRefreshing = true;

//       const data = {
//         refreshToken: refreshToken,
//       };

//       var url = new URL(HOST + "/api/auth/refreshtoken");
//       console.log("oldAguments", oldAguments);

//       await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify(data),
//       })
//         /*         .catch((error) => {
//           chrome.storage.sync.set({ refreshToken: null });
//           chrome.storage.sync.set({ access_token: null });
//           chrome.tabs.create({
//             url: AUTH_URL,
//             active: false,
//           });
//         }) */
//         // .then(function (response) {
//         //   return response.json();
//         // })
//         .then(async (result) => {
//           if (result) {
//             if (result.status == 200) {
//               var data = await result.json();
//               refreshToken = data.refreshToken;
//               access_token = data.accessToken;
//               chrome.storage.sync.set({ refreshToken: refreshToken });
//               chrome.storage.sync.set({ access_token: access_token });
//               isRefreshing = false;
//               login = true;
//               oldAguments[1] = {
//                 headers: { Authorization: "Bearer " + access_token },
//               };
//               // const newResponse = await originalFetch.apply(this, arguments);
//               let newResponse = await fetch(oldAguments[0], oldAguments[1]);
//               return newResponse;
//             } else {
//               logoff();
//               isRefreshing = false;
//               return oldResponse;
//             }
//           }
//         });
//     }
//   });
// }
/* 
var isRefreshing = false;
fetch = function () {
  let self = this;
  let args = arguments;
  if (access_token != "" && access_token != null && args[0].origin == HOST) {
    args[1] = { headers: { Authorization: "Bearer " + access_token } };
  }
  return originalFetch.apply(self, args).then(async function (data) {
    if (data.status === 200) console.log("---------Status 200----------");
    if (data.status === 401) {
      // request for token with original fetch if status is 401
      // if status is 401 from token api return empty response to close recursion
      console.log("==========401 UnAuthorize.=============");
      chrome.storage.sync.get("refreshToken", function (result) {
        refreshToken = result.refreshToken;
        if (refreshToken && !isRefreshing && login == true) {
          isRefreshing = true;

          const params = {
            refreshToken: refreshToken,
          };

          var url = new URL(HOST + "/api/auth/refreshtoken");

          url.search = new URLSearchParams(params).toString();

          fetch(url, { method: "POST" })
            .catch((error) => {
              chrome.storage.sync.set({ refreshToken: null });
              chrome.storage.sync.set({ access_token: null });
              chrome.tabs.create({
                url: AUTH_URL,
                active: false,
              });
            })
            .then((r) => r.json())
            .then((result) => {
              if (result) {
                if (result.status == 400) {
                  login = false;
                  chrome.storage.sync.set({ refreshToken: null });
                  chrome.storage.sync.set({ access_token: null });
                  chrome.tabs.create({
                    url: AUTH_URL,
                    active: false,
                  });
                  isRefreshing = false;
                } else {
                  refreshToken = result.refreshToken;
                  access_token = result.accessToken;
                  chrome.storage.sync.set({ refreshToken: refreshToken });
                  chrome.storage.sync.set({ access_token: accessToken });
                  isRefreshing = false;
                  login = true;
                  return fetch(self, args);
                }
              }
            });
        }
      });

      // else set token
      // recall old fetch
      // here i used 200 because 401 or 404 old response will cause it to rerun
      // return fetch(...args); <- change to this for real scenarios
      // return fetch(args[0], args[1]); <- or to this for real sceaerios
    }
    // condition will be tested again after 401 condition and will be ran with old args
    if (data.status === 404) {
      console.log("==========404 Not Found.=============");
      // here i used 200 because 401 or 404 old response will cause it to rerun
      // return fetch(...args); <- change to this for real scenarios
      // return fetch(args[0], args[1]); <- or to this for real scenarios
      sceaerios;
    } else {
      return data;
    }
  });
};
 */

let originalRequest = async (url, config) => {
  let response = await fetch(url, config);
  let data = await response.json();
  console.log("REQUESTING:", data);
  return { response, data };
};

let getRefreshToken = async () => {
  let refreshToken = await readLocalStorage("refreshToken");

  const data = {
    refreshToken: refreshToken,
  };

  var url = new URL(HOST + "/api/auth/refreshtoken");

  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  let json = await response.json();
  return json.accessToken;
};

let customFetcher = async (url, config = {}) => {
  // const user = jwt_decode(authTokens.access)
  // const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

  // if(isExpired){
  //     authTokens = await refreshToken(authTokens)
  // }

  //Proceed with request

  config["headers"] = {
    Authorization: "Bearer " + access_token,
  };

  console.log("Before Request");
  let { response, data } = await originalRequest(url, config);
  console.log("After Request");

  if (response.statusText === "Unauthorized") {
    access_token = await getRefreshToken();

    config["headers"] = {
      Authorization: "Bearer " + access_token,
    };

    let newResponse = await originalRequest(url, config);
    response = newResponse.response;
    data = newResponse.data;
  }

  return { response, data };
};

const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function (result) {
      if (result[key] === undefined) {
        reject();
      } else {
        resolve(result[key]);
      }
    });
  });
};
