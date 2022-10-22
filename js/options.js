var curemail = null;
// var maxnumber = localStorage["maxtabnumber"];

// if (maxnumber == null) {
//     maxnumber = MAXTABNUMBER;
//     localStorage["maxtabnumber"] = maxnumber;
// }
// var tome;
// if (localStorage['tome'])
//     tome = toBool(localStorage['tome']);
// else {
//     tome = TOME;
//     localStorage['tome'] = tome;
// }

// var toall;
// if (localStorage['toall'])
//     toall = toBool(localStorage['toall']);
// else {
//     toall = TOALL;
//     localStorage['toall'] = toall;
// }

// var enableCommentBtn;
// if (localStorage['enableCommentBtn'])
//     enableCommentBtn = toBool(localStorage['enableCommentBtn']);
// else {
//     enableCommentBtn = ENABLECOMMENTBTN;
//     localStorage['enableCommentBtn'] = enableCommentBtn;
// }

var app = angular.module('myApp', []);

app.controller('userInfoBox', function($scope, $http) {

    $scope.maxTabNumber = localStorage['maxnumber'];
    $scope.toAll = toBool(localStorage['toall']);
    $scope.ccToMe = toBool(localStorage['tome']);
    $scope.enableCommentBtn = toBool(localStorage['enableCommentBtn']);

    $scope.emailSubscription = toBool(localStorage["emailSubscription"]);
    $scope.favurlSubscription = toBool(localStorage["favurlSubscription"]);

    $scope.email = localStorage["email"];
    $scope.nickname = localStorage["nickname"];
    $scope.userPageLink = host + '/user/' + localStorage["id"];
    $scope.avatarURL = localStorage["avatarURL"];


    $scope.signOut = function() {
        curemail = null;
        window.location.href = host + "/api/service/logoff";
        chrome.extension.sendRequest({ action: 'logoff' }, function(response) {
            console.log('option page log off');
        });
    };

    $scope.saveMaxTabNumber = function() {
        localStorage["maxtabnumber"] = $scope.maxTabNumber;
    };

    $scope.saveToAll = function() {
        localStorage["toall"] = $scope.toAll;
    };

    $scope.saveCcToMe = function() {
        localStorage["tome"] = $scope.ccToMe;
    };


    $scope.updateFavurlSubscription = function() {

        favurlSubscription = $scope.favurlSubscription;
        $.ajax({
            type: "post",
            url: host + "/api/user/update",
            data: { "favurlsubscription": favurlSubscription },
            datatype: "text",
            success: function(data) {
                localStorage["favurlSubscription"] = favurlSubscription;
            }
        });
    };


    $scope.updateEmailSubscription = function() {
        emailSubscription = $scope.emailSubscription;

        $.ajax({
            type: "post",
            url: host + "/api/user/update",
            data: { "emailsubscription": emailSubscription },
            datatype: "text",
            success: function(data) {
                localStorage["emailSubscription"] = emailSubscription;
            }
        });

    };

    $scope.saveBtnSwitch = function() {
        var enableCommentBtn = $scope.enableCommentBtn;
        localStorage["enableCommentBtn"] = enableCommentBtn;

        chrome.storage.local.set({ "enableCommentBtn": enableCommentBtn }, function() {
            console.log("chreom storge local set enableCommentBtn");
        });
    };

    $scope.mark = [];

    var getGroupInfo = function() {
        var groupsstr = localStorage["groups"];
        if (groupsstr != null) {
            var groups = JSON.parse(groupsstr);
            $scope.Groups = groups;
            if (groups) {
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i].status == 3) {
                        $scope.mark.push(true);
                    } else {
                        $scope.mark.push(false);
                    }
                }
            }
        }

    };

    getGroupInfo();

    $scope.markGroup = function(Group, index) {

        var groupsstr = localStorage["groups"];
        var groups = undefined;
        if (groupsstr != null) {
            groups = JSON.parse(groupsstr);
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].id == Group.id) {
                    if ($scope.mark[index] == true) {
                        groups[i].status = 3;
                    } else {
                        groups[i].status = 0;
                    }

                    break;
                }
            }

            localStorage["groups"] = JSON.stringify(groups);
        }
    };

});

/*function addSignOutEvent() {
    $('#signout').click(function() {
        curemail = null;
        window.location.href = host + "/api/service/logoff";
        chrome.extension.sendRequest({ action: 'logoff' }, function(response) {
            console.log('option page log off');
        });
    });
}*/

/*function addTabNumChangeEvent() {
    var temp;
    $("#maxtabnumber").bind({
        focusin: function() {
            temp = $(this).val();
        },
        focusout: function() {
            var lastValue = $(this).val();
            if (temp != lastValue && null != lastValue && "" != lastValue) {
                localStorage["maxtabnumber"] = lastValue;
            }
        }
    });
}

function addCCmeCheckEvent() {
    $('.ccme_check').click(function() {
        localStorage['tome'] = this.checked;
    });
}

function addToallCheckEvent() {
    $('.toall_check').click(function() {
        localStorage['toall'] = this.checked;
    });
}*/
/*function displayGroups() {
    var groupsstr = localStorage["groups"];
    if (groupsstr != null) {
        var groups = JSON.parse(groupsstr);

        $('#group_box li').remove();

        $(groups).each(function() {
            var str1 = '<li data-id="' + this.id + '">';

            var str2 = '';
            if (this.status == 3)
                str2 = '<input type="checkbox" class="group_check" checked="true" />';
            else
                str2 = '<input type="checkbox" class="group_check" />';

            var str3 = '<label >' + this.name + '</label >';
            var str4 = '</li>';
            var str = str1 + str2 + str3 + str4;
            $('#group_box').append(str);
        })

    }
}*/

/*function setGroupStatus(groupid, status) {
    var groupsstr = localStorage["groups"];
    var groups = undefined;
    if (groupsstr != null) {
        groups = JSON.parse(groupsstr);

        for (var i = 0; i < groups.length; i++) {
            if (groups[i].id == groupid) {
                groups[i].status = status;
                break;
            }
        }

    }
    localStorage["groups"] = JSON.stringify(groups);
}

function addGroupCheckEvent() {
    $('#group_box li .group_check').on("click", function() {
        var groupid = $(this).parents('li').attr('data-id');
        if (this.checked) {
            setGroupStatus(groupid, 3);
        } else {
            setGroupStatus(groupid, 0);
        }
    });
}*/

function restore_options() {

    /*    var maxnumber = localStorage["maxtabnumber"];

        if (maxnumber == null) {
            maxnumber = MAXTABNUMBER;
            localStorage["maxtabnumber"] = maxnumber;
        }

        $('#maxtabnumber').val(maxnumber);

        var tome;
        if (localStorage['tome'])
            tome = toBool(localStorage['tome']);
        else {
            tome = TOME;
            localStorage['tome'] = tome;
        }

        $('.ccme_check')[0].checked = tome;

        var toall;
        if (localStorage['toall'])
            toall = toBool(localStorage['toall']);
        else {
            toall = TOALL;
            localStorage['toall'] = toall;
        }

        $('.toall_check')[0].checked = toall;*/


    // addCCmeCheckEvent();
    // addToallCheckEvent();

    // getGroups();
    // displayGroups();
    // addGroupCheckEvent();
}

onload = function() {

    console.log("init");
    chrome.cookies.get({ name: "current_USERID", url: cookieDomain }, function(cookie) {

        if (cookie != null) {
            curemail = cookie.value;
        } else {
            curemail = null;
        }

        if (curemail == null) {
            chrome.tabs.create({ url: authurl }, null);
            window.close();
        }
    });


}