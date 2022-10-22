var host = "http://localhost:4200/";
var cookieDomain = "http://localhost:4200/";

// var host = "http://35.235.67.247";
// var cookieDomain = "http://35.235.67.247";

// var host = "https://tsaheylu.me";
// var cookieDomain = "https://tsaheylu.me";
var authurl = host + "/login";
var msgPageUrl = host + "/messages";
var talkgadgeturl = "https://talkgadget.google.com/talkgadget/dch/test";
var cookiename = "current_USERID";
var MAXTABNUMBER = 20;
var TOALL = true;
var TOME = false;
var ENABLECOMMENTBTN = false;

var notLoginIcon = "images/notlogin.png";
var loginIcon = "images/login.png";

var defaultAvatarURL = host + "/images/mystery-man.jpg";

var toBool = function (str) {
  if ("false" === str) return false;
  if ("true" === str) return true;
};

function log(str) {
  console.log(getCurLocalTime() + " - " + str);
}

function getLocalSendTime(sendtime) {
  var d = new Date(sendtime);
  var sendtime = d.format("yyyy-MM-dd hh:mm:ss");
  return sendtime;
}

function getUTCSendTime() {
  var d = new Date();
  var localTime = d.getTime();
  localOffset = d.getTimezoneOffset() * 60000;
  utc = localTime + localOffset;
  var nd = new Date(utc);
  var sendtime = nd.format("yyyy-MM-dd hh:mm:ss");
  return sendtime;
}

function getCurLocalTime() {
  var d = new Date();
  var sendtime = d.format("yyyy-MM-dd hh:mm:ss");
  return sendtime;
}

Date.prototype.format = function (format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    S: this.getMilliseconds(), //millisecond
  };

  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return format;
};

function getGroups() {
  log("getGroups");
  $.ajax({
    type: "get",
    url: host + "/api/group/info",
    dataType: "json",
    // async: false,
    success: function (data) {
      if (data) {
        var newgroups = data.GroupDTOs;
        saveGroups(newgroups);
      }
    },
  });
}

function saveGroups(newgroups) {
  var group_datas = new Array();
  if (newgroups.length > 0) {
    // var groupsstr = localStorage["groups"];

    chrome.storage.local.get("groups", function (result) {
      groupsstr = result["groups"];
    });

    if (groupsstr != null) {
      var groups = JSON.parse(groupsstr);

      for (var i = 0; i < newgroups.length; i++) {
        var newid = newgroups[i].id;

        for (var j = 0; j < groups.length; j++) {
          var id = groups[j].id;

          if (id == newid) {
            var status = groups[j].status;
            newgroups[i].status = status;
            break;
          }
        }
      }
    }

    for (var i = 0; i < newgroups.length; i++) {
      var gd = new group_data(
        newgroups[i].id,
        newgroups[i].name,
        newgroups[i].status,
        newgroups[i].des,
        newgroups[i].num
      );
      group_datas[i] = gd;
    }
  }

  // localStorage["groups"] = JSON.stringify(group_datas);

  chrome.storage.local.set(
    { groups: JSON.stringify(group_datas) },
    function () {
      log("save groups");
    }
  );
}

function group_data(id, name, status, des, num) {
  this.id = id;
  this.name = name;
  this.status = status;
  this.des = des;
  this.num = num;
  if (this.status == 3) this.mark = true;
  else this.mark = false;
}
