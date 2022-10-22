var app = angular.module('myApp', ['infinite-scroll', 'ngSanitize']);

var defaultIconURL = '../images/defaulticon.ico';
var defaultAvatarURL = '../images/mystery-man.jpg';

app.directive('ckeditor', function() {
    return {
        require: '?ngModel',
        link: function(scope, elm, attr, ngModel) {

            if (!ngModel) return;
            InlineEditor
                .create(elm[0])
                .then(editor => {
                    editor.model.document.on('change:data', () => {

                        // console.log(Array.from(editor.ui.componentFactory.names));

                        ngModel.$setViewValue(editor.getData());
                        // Only `$apply()` when there are changes, otherwise it will be an infinite digest cycle
                        if (editor.getData() !== ngModel.$modelValue) {
                            scope.$apply();
                        }
                    });
                    ngModel.$render = () => {
                        editor.setData(ngModel.$modelValue);
                    };
                    scope.$on('$destroy', () => {
                        editor.destroy();
                    });
                });
        }
    }

});


app.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {

            scope.$watch(element, function() {
                if (!element.attr('src')) {
                    element.attr('src', attrs.errSrc);
                }
            });

            element.bind('error', function() {
                element.attr('src', attrs.errSrc);
            });
        }
    }
});

app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.directive('ngCtrlEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngCtrlEnter);
                });

                event.preventDefault();
            }
        });
    };
});


app.filter('to_trusted', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}])

var currentTabUrl;
var currentTabTitle;
var currentTabIcon;

app.controller('com_box', function($scope, $location, $http, CommentService) {

    var searching = false;
    var getfavurltype;
    var searchWord = '';
    $scope.commentEditorVisible = false;
    $scope.commentButtonVisible = true;

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        currentTabUrl = tabs[0].url;
        currentTabTitle = tabs[0].title;
        currentTabIcon = tabs[0].favIconUrl;

        $scope.CommentService.url = currentTabUrl;
        $scope.CommentService.urltitle = currentTabTitle;
        $scope.CommentService.urlicon = currentTabIcon;
        $scope.CommentService.getInfo();
        // $scope.CommentService.getURLFavContacts();

    });

    $scope.CommentService = new CommentService($scope);

    $scope.CommentService.id = localStorage["id"];
    $scope.avatarURL = localStorage["avatarURL"];

    $scope.searchCom = function() {
        searchWord = $scope.searchWord;

        if (searchWord != '') {
            $scope.CommentService.Comments = [];
            $scope.CommentService.searchstop = false;
            $scope.CommentService.noSearchResult = false;
            $scope.CommentService.searchsc = '';
            searching = true;
            $scope.CommentService.search(searchWord);
        }

    }


    $scope.showCommentEditor = function() {
        $scope.commentEditorVisible = true;
        $scope.commentButtonVisible = false;
    }

    $scope.hideCommentEditor = function() {
        $scope.commentEditorVisible = false;
        $scope.commentButtonVisible = true;
    }

    $scope.clearSearchResult = function() {
        $scope.CommentService.Comments = [];
        $scope.CommentService.sc = '';
        $scope.CommentService.searchsc = '';
        $scope.CommentService.stop = false;
        $scope.CommentService.searchstop = false;
        $scope.CommentService.noSearchResult = false;
        searching = false;
        searchWord = '';
        $scope.CommentService.NextPage(getfavurltype);
        $scope.searchWord = '';
        $('#search_clear').fadeOut(100);
    }

    var getcomstype = 'pub';
    $scope.infiniteScroll = function() {

        if (searching) {
            $scope.CommentService.search(searchWord);
        } else
            $scope.CommentService.getComs(getcomstype);

    }

    $scope.addComment = function() {

        var data = $scope.commentContent;
        if (data) {

            // var tree = angular.element(data);
            // tree.find('a').attr('target', '_blank');

            var tree = $(data);
            tree.find('a').attr('target', '_blank');

            var content = "";
            for (var i = 0; i < tree.length; i++) {
                content = content + tree[i].outerHTML;
            }

            $scope.CommentService.addCom(content);
            $scope.commentEditorVisible = false;
            $scope.commentButtonVisible = true;
            $scope.commentContent = '';
        }

    }

    $scope.getAllComs = function() {
        getcomstype = 'pub';
        $scope.CommentService.Comments = [];
        $scope.CommentService.sc = '';
        $scope.CommentService.stop = false;
        $scope.CommentService.getComs(getcomstype);

    }

    $scope.getComsFromFrd = function() {
        getcomstype = 'frd';
        $scope.CommentService.Comments = [];
        $scope.CommentService.sc = '';
        $scope.CommentService.stop = false;
        $scope.CommentService.getComs(getcomstype);
    }

});



app.factory('CommentService', function($rootScope, $http) {

    var CommentService = function() {
        this.Comments = [];
        this.busy = false;
        this.sc = '';
        this.searchsc = '';
        this.stop = false;
        this.searchstop = false;
        this.noSearchResult = false;
        this.urlid = '';
        this.url = '';
        this.urltitle = '';
        this.urlicon = '';
        this.id = '';
        this.share = 0;
        this.host = '';
        this.FavContacts = [];
        this.ShareContacts = [];
    };

    CommentService.prototype.getInfo = function() {
        this.busy = true;
        $http.get(encodeURI(host + "/api/linkInfo?url=" + this.url + "&icon=" + this.urlicon + "&title=" + this.urltitle)).then(function(response) {
            var data = response.data;
            var urlinfo = data.URLInfo;
            this.share = urlinfo.share;
            this.host = urlinfo.host;
            this.url = urlinfo.url;
            this.urlicon = urlinfo.icon;
            this.urltitle = urlinfo.title;
            this.urlid = urlinfo.id;
            this.favs = urlinfo.favs;
            this.initGetComs("pub");
            this.getURLFavContacts();
            this.getURLShareContacts();

        }.bind(this));
    };

    CommentService.prototype.initGetComs = function(type) {
        if (this.stop) return;
        $http.get(host + "/api/comment/urlid?type=" + type + "&urlid=" + this.urlid + "&startCursor=" + this.sc).then(function(response) {
            var data = response.data;
            var comments = data.Comments;
            if (comments) {
                for (var i = 0; i < comments.length; i++) {
                    comments[i].show = true;
                    // comments[i].deleteConfirmBox =false;
                    var sendt = getLocalSendTime(comments[i].sendtime);
                    comments[i].sendtime = jQuery.timeago(sendt);
                    comments[i].show = true;
                    this.Comments.push(comments[i]);
                }
            }

            if (this.sc == data.startCursor)
                this.stop = true

            this.sc = data.startCursor;

            this.busy = false;

        }.bind(this));
    };


    CommentService.prototype.getComs = function(type) {
        if (this.stop) return;
        if (this.busy) return;

        this.busy = true;

        $http.get(host + "/api/comment/urlid?type=" + type + "&urlid=" + this.urlid + "&startCursor=" + this.sc).then(function(response) {
            var data = response.data;
            var comments = data.Comments;
            if (comments) {
                for (var i = 0; i < comments.length; i++) {
                    comments[i].show = true;
                    // comments[i].deleteConfirmBox =false;
                    var sendt = getLocalSendTime(comments[i].sendtime);
                    comments[i].sendtime = jQuery.timeago(sendt);
                    comments[i].show = true;
                    this.Comments.push(comments[i]);
                }
            }

            if (this.sc == data.startCursor)
                this.stop = true

            this.sc = data.startCursor;

            this.busy = false;

        }.bind(this));
    };

    CommentService.prototype.getComsByHost = function() {
        if (this.stop) return;
        if (this.busy) return;

        this.busy = true;

        $http.get(host + "/api/comment/pub/host?urlid" + this.urlid + "&startCursor=" + this.sc).then(function(response) {
            var data = response.data;
            var comments = data.Comments;
            if (comments) {
                for (var i = 0; i < comments.length; i++) {
                    comments[i].show = true;
                    // comments[i].deleteConfirmBox =false;
                    var sendt = getLocalSendTime(comments[i].sendtime);
                    comments[i].sendtime = jQuery.timeago(sendt);
                    comments[i].show = true;
                    this.Comments.push(comments[i]);
                }
            }

            if (this.sc == data.startCursor)
                this.stop = true

            this.sc = data.startCursor;

            this.busy = false;

        }.bind(this));
    };

    CommentService.prototype.addCom = function(content) {

        $http({
            method: "POST",
            // url: host + "/api/comment/add?content=" + content + "&urlid=" + this.urlid + "&sendtime=" + getUTCSendTime(),
            url: host + "/api/comment/add",
            params: { urlid: this.urlid, sendtime: getUTCSendTime() },
            data: content,
        }).then(function(response) {
            var data = response.data;
            var msg = data.result;
            if (msg) {
                var comments = data.Comments;
                if (comments) {
                    for (var i = 0; i < comments.length; i++) {
                        comments[i].show = true;
                        var sendt = getLocalSendTime(comments[i].sendtime);
                        comments[i].sendtime = jQuery.timeago(sendt);
                        comments[i].show = true;
                        this.Comments.unshift(comments[i]);
                    }
                }

                $rootScope.commentContent = '';
            }

        }.bind(this));
    };



    CommentService.prototype.getURLFavContacts = function() {

        $http.get(host + "/api/urlinfo/fav/contacts?urlid=" + this.urlid + "&startCursor=" + this.startCursor).then(function(response) {

            var data = response.data;
            var contacts = data.Contacts;
            if (contacts) {
                for (var i = 0; i < contacts.length; i++) {
                    contacts[i].show = true;
                }
                this.FavContacts = contacts;
            }


        }.bind(this));
    };

    CommentService.prototype.getURLShareContacts = function() {

        $http.get(host + "/api/urlinfo/share/contacts?urlid=" + this.urlid + "&startCursor=" + this.startCursor).then(function(response) {

            var data = response.data;
            var contacts = data.Contacts;
            if (contacts) {
                for (var i = 0; i < contacts.length; i++) {
                    contacts[i].show = true;
                }
                this.ShareContacts = contacts;
            }
        }.bind(this));
    };

    return CommentService;
});

function Comment(avatarURL, sendtime, fromid, nickname, content) {
    this.avatarURL = avatarURL;
    this.sendtime = sendtime;
    this.fromid = fromid;
    this.sendtime = sendtime;
    this.nickname = nickname;
    this.content = content;
}
// editor.model.document.on(‘change: data’, () => {
//     const data = editor.getData();
//     console.log(data);
// });

$(document).ready(function() {

    $('.com_box').on(
        'mouseenter', 'li',
        function() {
            $(this).find(".reply").fadeIn(100)
        }
    )

    $('.com_box').on(
        'mouseleave', 'li',
        function() {
            $(this).find(".reply").fadeOut(100);
        }
    )


    $('.com_box .reply').on("click", function() {
        var li = $(this).parents('li');

        var userid = li.find(".commenter").attr('oid');
        var nickname = li.find(".replyer").html();

        var ui_content = $(this).parents('.ui_content');

        ui_content.find(".editor_line").html('<button contenteditable="false" oid=' + userid + ' class="touser">@' + nickname + '</button>');
        ui_content.find(".editor_outer").show();
        ui_content.find(".add").hide();
    });


    /*    InlineEditor
            .create(document.querySelector('#editor_main'))
            .then(editor => {
                console.log(editor);
            })
            .catch(error => {
                console.error(error);
            });
    */




    // CKEDITOR.replace( 'editor_main' );

    /*  $('.add_com').on("click", '.cancel', function() {
          var li = $(this).parents('.ui_content');
          li.find(".editor_outer").hide();
          li.find(".add").show();
          li.find(".editor_line").empty();
          li.find(".post").addClass("disable");
      })

      $('.add').on("click", function() {
          var li = $(this).parents('.ui_content');
          li.find(".editor_outer").show();
          $(this).hide();
          li.find(".editor_line").trigger("focus");
      })

      $('.editor_line').on("keyup", function() {
          var li = $(this).parents('.ui_content');

          var content = $(this).text();
          var post = li.find('.post');
          if (content != '')
              post.removeClass("disable");
          else
              post.addClass("disable");

      })

      $('.com_box_frd').on(
          'mouseenter', 'li',
          function() {
              $(this).find(".reply").fadeIn(100);
          }
      )

      $('.com_box_frd').on(

          'mouseleave', 'li',
          function() {
              $(this).find(".reply").fadeOut(100);
          }
      )

      $('.add_com').on("click", '.cancel', function() {
          var li = $(this).parents('.ui_content');
          li.find(".editor_outer").hide();
          li.find(".add").show();
          li.find(".editor_line").empty();
          li.find(".post").addClass("disable");
      })

      $('.com_box_frd li,.com_box_pub li').on({

          mouseenter: function() {
              $(this).find(".reply").fadeIn(100)
          },
          mouseleave: function() {
              $(this).find(".reply").fadeOut(100);
          }
      })

      $('.com_box_frd .reply,.com_box_pub .reply').on("click", function() {
          var li = $(this).parents('li');

          var userid = li.find(".commenter").attr('oid');
          var nickname = li.find(".replyer").html();

          var ui_content = $(this).parents('.ui_content');

          ui_content.find(".editor_line").html('<button contenteditable="false" oid=' + userid + ' class="touser">@' + nickname + '</button>');
          ui_content.find(".editor_outer").show();
          ui_content.find(".add").hide();
      });*/

    $('.close').click(function() {
        chrome.runtime.sendMessage({
            action: 'hide'
        });
    });

});