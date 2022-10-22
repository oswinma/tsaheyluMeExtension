//try{
if (window.theFLOAT_RECEIVE)
    window.theFLOAT_RECEIVE.Recieve();

else {
    try { if (ISRIL_H) {} } catch (e) { ISRIL_H = 0; }
    try { if (ISRIL_TEST) {} } catch (e) { ISRIL_TEST = false; }
    try { if (PKT_D) {} } catch (e) { PKT_D = 'tsahaylu.com'; }

    /*
    FLOAT_RECEIVE_OVERLAY is the view itself and contains all of the methods to manipute the overlay and messaging.
    It does not contain any logic for saving or communication with the extension or server.
    */
    var FLOAT_RECEIVE_OVERLAY = function(options) {
        this.inited = false;

        this.saveTagsCallback = options.saveTagsCallback;
    }
    FLOAT_RECEIVE_OVERLAY.prototype = {
        create: function() {
            // remove any existing elements
            var existingStyle = document.getElementById('FLOAT_RECEIVE_STYLE');
            if (existingStyle)
                existingStyle.parentNode.removeChild(existingStyle);

            var existingOverlay = document.getElementById('FLOAT_RECEIVE_OVERLAY');
            if (existingOverlay)
                existingOverlay.parentNode.removeChild(existingOverlay);

            // figure out how much we need to scale the overlay to match the user's zoom level
            var scale = window.innerWidth / screen.availWidth;
            if (scale < 1)
                scale = 1;

            var userAgent = window.navigator.userAgent;
            this.isMobile = (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i));
            this.isFirefox = userAgent.match(/firefox/i) != null;

            // overlay values	
            var height = (this.isMobile ? 60 : 80) * scale;
            var fontSize = (this.isMobile ? 18 : 20) * scale;
            var lineHeight = (this.isMobile ? height * 0.95 : height);
            var labelWeight = (this.isMobile ? 'normal' : 'bold');

            // button values
            var borderRadius = 6 * scale;
            var btnTop = 17 * scale;
            var btnWidth = 80 * scale;
            var btnHeight = 30 * scale;
            var btnLineHeight = 30 * scale;
            var btnBorder = (1 * scale);
            if (btnBorder < 1)
                btnBorder = 1;

            // text field values
            var fieldTop = 19 * scale;
            var fieldHeight = 25 * scale;
            var fieldFontSize = 15 * scale;


            this.shadowHeight = 20;

            var styles = '\
			#FLOAT_RECEIVE_OVERLAY\
			{\
				visibility:hidden;\
				position:fixed;\
				top:0px;\
				left:0px;\
				width:100%;\
				height:' + height + 'px;\
				-webkit-box-shadow:0px 0px ' + this.shadowHeight + 'px rgba(0,0,0,0.4);\
				-moz-box-shadow:0px 0px ' + this.shadowHeight + 'px rgba(0,0,0,0.4);\
				-o-box-shadow:0px 0px ' + this.shadowHeight + 'px rgba(0,0,0,0.4);\
				box-shadow:0px 0px ' + this.shadowHeight + 'px rgba(0,0,0,0.4);\
				z-index:999999999;\
				background: rgb(239,239,239);\
				background: -moz-linear-gradient(top, rgba(239,239,239,0.98) 0%, rgba(253,253,253,0.98) 100%);\
				background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(239,239,239,0.98)), color-stop(100%,rgba(253,253,253,0.98)));\
				background: -webkit-linear-gradient(top, rgba(239,239,239,0.98) 0%,rgba(253,253,253,0.98) 100%);\
				background: -o-linear-gradient(top, rgba(239,239,239,0.98) 0%,rgba(253,253,253,0.98) 100%);\
				background: -ms-linear-gradient(top, rgba(239,239,239,0.98) 0%,rgba(253,253,253,0.98) 100%);\
				background: linear-gradient(top, rgba(239,239,239,0.98) 0%,rgba(253,253,253,0.98) 100%);\
				filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#efefef\', endColorstr=\'#fdfdfd\',GradientType=0 );\
				border-bottom:1px solid white;\
				font-size:' + fontSize + 'px !important;\
				font-family:HelveticaNeue,Helvetica,Arial !important;\
				line-height:' + lineHeight + 'px !important;\
				text-align: left;\
				color: #4b4b4b !important;\
				-webkit-transform:translate3d(0px,0px,0px);\
			}\
			\
			#FLOAT_RECEIVE_RAINBOWDASH\
			{\
				width: 100%;\
				height: 6%;\
			}\
			#FLOAT_RECEIVE_RAINBOWDASH div\
			{\
				float: left;\
				width: 25%;\
				height: 100%;\
			}\
			.PKT_mobile #FLOAT_RECEIVE_OVERLAY_LOGO\
			{\
				display: none;\
			}\
			#FLOAT_RECEIVE_OVERLAY_WRAPPER\
			{\
				height: 100%;\
				padding-left: 7%;\
			}\
			\
			.FLOAT_RECEIVE_BTN\
			{\
				float: right;\
				margin-top: 22px;\
				margin-left: 20px;\
				width: ' + btnWidth + 'px;\
				height: ' + btnHeight + 'px;\
				line-height: ' + btnLineHeight + 'px;\
				visibility:hidden;\
				border:' + btnBorder + 'px solid #a4a4a4;\
				text-shadow: 0px ' + btnBorder + 'px 0px rgba(255, 255, 255, 0.7);\
				-webkit-box-shadow: 0px ' + btnBorder + 'px 0px white;\
				-moz-box-shadow: 0px ' + btnBorder + 'px 0px white;\
				-o-box-shadow: 0px ' + btnBorder + 'px 0px white;\
				box-shadow: 0px ' + btnBorder + 'px 0px white;\
				-webkit-border-radius: ' + borderRadius + 'px;\
				-moz-border-radius: ' + borderRadius + 'px;\
				-o-border-radius: ' + borderRadius + 'px;\
				border-radius: ' + borderRadius + 'px;\
				text-align:center !important;\
				font-size:0.7em !important;\
				color:black !important;\
				font-weight:bold !important;\
				background: rgb(250,213,64);\
				background: -moz-linear-gradient(top, rgba(250,213,64,1) 0%, rgba(251,182,74,1) 100%);\
				background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(250,213,64,1)), color-stop(100%,rgba(251,182,74,1)));\
				background: -webkit-linear-gradient(top, rgba(250,213,64,1) 0%,rgba(251,182,74,1) 100%);\
				background: -o-linear-gradient(top, rgba(250,213,64,1) 0%,rgba(251,182,74,1) 100%);\
				background: -ms-linear-gradient(top, rgba(250,213,64,1) 0%,rgba(251,182,74,1) 100%);\
				background: linear-gradient(top, rgba(250,213,64,1) 0%,rgba(251,182,74,1) 100%);\
				filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#fad540\', endColorstr=\'#fbb64a\',GradientType=0 );\
				text-decoration: none !important;\
				-moz-transform:translate3d(0px,0px,0px);\
				-o-transform:translate3d(0px,0px,0px);\
				-webkit-transform:translate3d(0px,0px,0px);\
				cursor:pointer;\
				margin-right:30px;\
			}\
			.FLOAT_RECEIVE_BTN:hover\
			{\
				background: rgb(251,182,74);\
				background: -moz-linear-gradient(top, rgba(251,182,74,1) 0%, rgba(250,213,64,1) 100%);\
				background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(251,182,74,1)), color-stop(100%,rgba(250,213,64,1)));\
				background: -webkit-linear-gradient(top, rgba(251,182,74,1) 0%,rgba(250,213,64,1) 100%);\
				background: -o-linear-gradient(top, rgba(251,182,74,1) 0%,rgba(250,213,64,1) 100%);\
				background: -ms-linear-gradient(top, rgba(251,182,74,1) 0%,rgba(250,213,64,1) 100%);\
				background: linear-gradient(top, rgba(251,182,74,1) 0%,rgba(250,213,64,1) 100%);\
				filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#fbb64a\', endColorstr=\'#fad540\',GradientType=0 );\
			}\
			.FLOAT_RECEIVE_BTN.gray\
			{\
				background: #f9f9f9;\
				background: -moz-linear-gradient(top, #f9f9f9 0%, #ebecec 100%);\
				background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#f9f9f9), color-stop(100%,#ebecec));\
				background: -webkit-linear-gradient(top, #f9f9f9 0%,#ebecec 100%);\
				background: -o-linear-gradient(top, #f9f9f9 0%,#ebecec 100%);\
				background: -ms-linear-gradient(top, #f9f9f9 0%,#ebecec 100%);\
				background: linear-gradient(top, #f9f9f9 0%,#ebecec 100%);\
				filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#f9f9f9\', endColorstr=\'#ebecec\',GradientType=0 );\
			}\
			.FLOAT_RECEIVE_BTN.gray:hover\
			{\
				background: #ebecec;\
				background: -moz-linear-gradient(top, #ebecec 0%, #f9f9f9 100%);\
				background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ebecec), color-stop(100%,#f9f9f9));\
				background: -webkit-linear-gradient(top, #ebecec 0%,#f9f9f9 100%);\
				background: -o-linear-gradient(top, #ebecec 0%,#f9f9f9 100%);\
				background: -ms-linear-gradient(top, #ebecec 0%,#f9f9f9 100%);\
				background: linear-gradient(top, #ebecec 0%,#f9f9f9 100%);\
				filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#ebecec\', endColorstr=\'#f9f9f9\',GradientType=0 );\
			}\
			.FLOAT_RECEIVE_BTN.green\
			{\
				background: #81dbd6;\
				background: -moz-linear-gradient(top, #81dbd6 0%, #74c5c1 100%);\
				background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#81dbd6), color-stop(100%,#74c5c1));\
				background: -webkit-linear-gradient(top, #81dbd6 0%,#74c5c1 100%);\
				background: -o-linear-gradient(top, #81dbd6 0%,#74c5c1 100%);\
				background: -ms-linear-gradient(top, #81dbd6 0%,#74c5c1 100%);\
				background: linear-gradient(top, #81dbd6 0%,#74c5c1 100%);\
				filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#81dbd6\', endColorstr=\'#74c5c1\',GradientType=0 );\
			}\
			.FLOAT_RECEIVE_BTN.green:hover\
			{\
				background: #74c5c1;\
				background: -moz-linear-gradient(bottom, #81dbd6 0%, #74c5c1 100%);\
				background: -webkit-gradient(linear, left bottom, left bottom, color-stop(0%,#81dbd6), color-stop(100%,#74c5c1));\
				background: -webkit-linear-gradient(bottom, #81dbd6 0%,#74c5c1 100%);\
				background: -o-linear-gradient(bottom, #81dbd6 0%,#74c5c1 100%);\
				background: -ms-linear-gradient(bottom, #81dbd6 0%,#74c5c1 100%);\
				background: linear-gradient(bottom, #81dbd6 0%,#74c5c1 100%);\
				filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#74c5c1\', endColorstr=\'#81dbd6\',GradientType=0 );\
			}\
			.FLOAT_RECEIVE_BTN div\
			{\
				display: block;\
			}\
			#PKT_FORM\
			{\
				height: 100%;\
				display: block !important;\
				visibility: visible !important;\
				margin: 0px !important;\
				padding: 0px !important;\
			}\
			.PKT_mobile #PKT_FORM{\
				position: absolute;\
				top: 0px;\
				right: 0.5em;\
				width: 86%;\
			}\
			.PKT_mobile #FLOAT_RECEIVE_BTN{\
				margin-top: ' + btnTop + 'px !important;\
			}\
			.PKT_mobile #FLOAT_RECEIVE_VL_BTN{\
				display: none;\
			}\
			#FLOAT_RECEIVE_OVERLAY_INPUT\
			{\
				display: none;\
			}\
			.PKT_SHOW_INPUT #FLOAT_RECEIVE_OVERLAY_INPUT\
			{\
				position: absolute !important;\
				display: block !important;\
				top: ' + fieldTop + 'px !important;\
				left: 0% !important;\
				width: 0px;\
				height: ' + fieldHeight + 'px !important;\
				border: ' + btnBorder + 'px solid #c9c9c9 !important;\
				margin: 0px !important;\
				padding: 0px 0px 0px 5px !important;\
				font-size: ' + fieldFontSize + 'px !important;\
				color: #666666 !important;\
				background: white !important;\
				\
				/* overrides */\
				font-family: Arial !important;\
				-webkit-box-shadow: none !important;\
				-moz-box-shadow: none !important;\
				box-shadow: none !important;\
				-webkit-border-radius: 0px !important;\
				-moz-border-radius: 0px !important;\
				border-radius: 0px !important;\
			}\
			.PKT_desktop #FLOAT_RECEIVE_OVERLAY_INPUT\
			{\
				float: right;\
				margin-top: 24px !important;\
				position: static !important;\
				width: 300px;\
			}\
			.PKT_SHOW_INPUT #FLOAT_RECEIVE_OVERLAY_LABEL\
			{\
				display: none;\
			}\
			#FLOAT_RECEIVE_OVERLAY_LOGO\
			{\
				 float:right; \
			}\
			#FLOAT_RECEIVE_OVERLAY_LOGO img\
			{\
				border=none;\
				height:80px;\
			}\
			#FLOAT_RECEIVE_USERLINK img\
			{\
				width:58px;\
				height:58px;\
				float: left;\
			}\
			#FLOAT_RECEIVE_USERLINK\
			{\
				width:58px;\
				height:58px;\
				padding:4px;\
				border:1px #e3e3e3 solid;\
				border-radius:3px;\
				background:#fff;\
				display:inline-block;\
			}\
			#FLOAT_RECEIVE_USER\
			{\
				margin: 0 auto;\
				float:left; \
				padding-top:6px;\
			}\
			#FLOAT_RECEIVE_INFO\
			{\
				float:left;\
				padding-left: 10px;\
				font-weight: ' + labelWeight + ';\
			}\
			#FLOAT_RECEIVE_NICKNAME\
			{\
				float:left !important;\
				padding-left: 10px !important;\
				font-weight: ' + labelWeight + '!important;\
			}\
			.PKT_desktop #FLOAT_RECEIVE_OVERLAY_LABEL\
			{\
				float:left !important;\
				padding-left: 10px !important;\
				font-weight: ' + labelWeight + '!important;\
			}\
			';

            // add overlay
            var overlay = '\
			<div id="FLOAT_RECEIVE_OVERLAY">\
				<div id="FLOAT_RECEIVE_OVERLAY_WRAPPER" class="PKT_' + (this.isMobile ? "mobile" : "desktop") + '">\
					<div id="FLOAT_RECEIVE_LOGO">\
					<a id="FLOAT_RECEIVE_OVERLAY_LOGO" target=_blank href="http://' + PKT_D + '"><img src="https://' + PKT_D + '/images/logo_col.png" ></a>\
					</div>\
					<div  id="FLOAT_RECEIVE_USER">\
					<a id="FLOAT_RECEIVE_USERLINK" target="_blank"><img id="FLOAT_RECEIVE_AVATARURL"></a>\
					</div>\
					<div id="FLOAT_RECEIVE_INFO">\
					<div id="FLOAT_RECEIVE_NICKNAME"></div>\
					<div id="FLOAT_RECEIVE_OVERLAY_LABEL"></div>\
					</div>\
					<a id="FLOAT_RECEIVE_BTN" class="FLOAT_RECEIVE_BTN" target="_blank" href=""></a>\
				</div>\
			</div>\
			';




            // add to DOM
            var overlayFakeContainer = document.createElement('div');
            overlayFakeContainer.innerHTML = '<style id="FLOAT_RECEIVE_STYLE">' + styles + '</style>' + overlay;
            document.body.appendChild(overlayFakeContainer);

            // site specific issues
            try {
                if (document.location.host.match('twitter.'))
                    (document.getElementsByClassName('topbar'))[0].style.position = 'absolute';
            } catch (e) {}

            // animate in
            var self = this;
            setTimeout(function() { self.show(); }, 30);

            if (!this.isMobile && window.addEventListener) {
                this.windowResizeHandler = {
                    handleEvent: function(e) {
                        self.updateVisibleElements();
                    }
                };

                window.addEventListener("resize", this.windowResizeHandler);
            }

            this.updateVisibleElements();
        },

        updateVisibleElements: function() {
            if (this.isMobile) return;

            var width = window.innerWidth;
            var isShowingTagsEditor = this.isTagsEditorOpen();
            //console.log("Responsiveness " + width + " " + isShowingTagsEditor);

            var logo = document.getElementById("FLOAT_RECEIVE_OVERLAY_LOGO");
            logo.style.display = (width < 850 && isShowingTagsEditor) ? "none" : "block";

            if (isShowingTagsEditor) {
                var textInput = document.getElementById("FLOAT_RECEIVE_OVERLAY_INPUT");

                var shortWidth = 650;
                var maxWidth = 850;
                if (width <= shortWidth) {
                    var button = document.getElementById("FLOAT_RECEIVE_BTN");
                    var buttonWidth = button.offsetWidth + parseInt(document.defaultView.getComputedStyle(button, null).marginLeft);
                    var newWidth = (width * 0.85) - buttonWidth - 5;
                    if (this.isFirefox) {
                        newWidth = newWidth - 20;
                    }
                    console.log("Shortest! " + buttonWidth + " " + width + " " + newWidth);
                    textInput.style.width = newWidth + "px";
                } else if (width > shortWidth && width <= maxWidth) {
                    var button = document.getElementById("FLOAT_RECEIVE_BTN");
                    var buttonWidth = button.offsetWidth + parseInt(document.defaultView.getComputedStyle(button, null).marginLeft);

                    var newWidth = (width * 0.80) - buttonWidth - viewListButtonWidth - 5;
                    textInput.style.width = "";
                } else {
                    textInput.style.width = "";
                }
            }

        },

        displayMessage: function(msg) {
            this.toggleClass(document.getElementById('FLOAT_RECEIVE_OVERLAY_WRAPPER'), 'PKT_SHOW_INPUT', false);

            document.getElementById('FLOAT_RECEIVE_OVERLAY_LABEL').innerHTML = msg;
        },


        showButton: function(label, href, callback, grayButton) {
            var btn = document.getElementById('FLOAT_RECEIVE_BTN');
            btn.style.visibility = label ? 'visible' : 'hidden';

            if (label) {
                btn.innerHTML = label;

                if (!href)
                    btn.removeAttribute('href');

                else
                    btn.href = href;

                if (callback) {
                    btn.onclick = function() {
                        callback();
                        //return false; // to prevent close action when tapping a button
                    };
                }

                this.toggleClass(btn, 'gray', grayButton);
            }
        },

        showViewListButton: function(label, href, callback) {
            if (this.isMobile) return;



            var otherBtn = document.getElementById("FLOAT_RECEIVE_BTN");

            if (label) {
                btn.innerHTML = label;
                //otherBtn.style.right = "1%";

                if (!href)
                    btn.removeAttribute('href');
                else
                    btn.href = href;

                if (callback) {
                    btn.onclick = function() {
                        callback();
                        //return false; // to prevent close action when tapping a button
                    };
                }

                this.toggleClass(btn, 'green', true);
            } else {
                //if(otherBtn.style.removeProperty){
                //otherBtn.style.removeProperty("right");
                //}else{
                //otherBtn.style.removeAttribute("right");
                //}
            }
        },

        getReadyToHide: function() {
            var self = this;
            clearTimeout(self.hideTO);
            self.hideTO = setTimeout(function() { self.hide(); }, 3000);
        },

        cancelPendingHide: function() {
            clearTimeout(this.hideTO);
            this.hideTO = undefined;
        },

        show: function() {
            this.hidesOnClick = false;
            this.cancelPendingHide();

            var overlay = document.getElementById('FLOAT_RECEIVE_OVERLAY');
            overlay.style[this.browserPrefix() + 'Transform'] = 'translate3d(0px,' + (0 - overlay.offsetHeight - this.shadowHeight) + 'px,0px)';
            overlay.style.visibility = 'visible';

            var self = this;
            overlay.onclick = function() {
                if (self.hidesOnClick)
                    self.hide();
            }

            setTimeout(function() {
                var prefix = self.browserPrefix();
                overlay.style[prefix + 'Transition'] = '-' + prefix + '-transform 0.3s ease-out';
                overlay.style[prefix + 'Transform'] = 'translate3d(0px,0px,0px)';
            }, 100);
        },

        hide: function() {
            if (this.isTagsEditorOpen()) return;

            var overlay = document.getElementById('FLOAT_RECEIVE_OVERLAY');
            overlay.style[this.browserPrefix() + 'Transform'] = 'translate3d(0px,' + (0 - overlay.offsetHeight - this.shadowHeight) + 'px,0px)';

            overlay.style.visibility = 'hidden';
            overlay.parentNode.removeChild(overlay);

            if (this.windowResizeHandler && window.removeEventListener) {
                window.removeEventListener("resize", this.windowResizeHandler);
            }
        },



        displayUser: function(nickname, userid, avatarurl) {
            this.toggleClass(document.getElementById('FLOAT_RECEIVE_OVERLAY_WRAPPER'), 'PKT_SHOW_INPUT', false);
            document.getElementById('FLOAT_RECEIVE_USERLINK').href = 'https://' + PKT_D + '/user/' + userid;
            document.getElementById('FLOAT_RECEIVE_AVATARURL').src = avatarurl;
            document.getElementById('FLOAT_RECEIVE_NICKNAME').innerHTML = nickname;

        },

        //
        recieved: function(nickname, userid, avatarurl, sendtime) {
            var self = this;
            this.displayMessage('sent this link to you, ' + sendtime + '.');
            this.displayUser(nickname, userid, avatarurl);

            //this.showButton('Add Tags', null, function(){self.openTagsEditor();}, true);
            this.showButton('Close', null, function() {
                self.hide();
            }, true);

            this.updateVisibleElements();
        },

        // 
        isTagsEditorOpen: function() {
            return (this.isShowingTagsEditor === true);
        },

        openTagsEditor: function() {
            this.isShowingTagsEditor = true;
            this.cancelPendingHide();

            var self = this;
            var hint = this.isMobile ? 'Add tags (tag1, tag2)' :
                'Add Tags (separated by commas)';
            this.showTextField(hint);

            var btnFunc = function() {
                self.isShowingTagsEditor = false;
                if (self.textField.value.length > 0)
                    self.showButton('Save', null, function() { self.saveTags(); });
                else
                    self.showButton('Close', null, function() { self.hide(); }, true);
            }
            btnFunc();

            var form = document.getElementById('PKT_FORM');
            form.onsubmit = function() { self.saveTags(); return false; }

            this.textField.onkeyup = btnFunc;
            this.updateVisibleElements();
        },

        saveTags: function() {
            this.isShowingTagsEditor = false;

            var newTags = [];
            var tracking = {};
            var tag;

            var tagsList = this.trim(document.getElementById('FLOAT_RECEIVE_OVERLAY_INPUT').value);

            if (tagsList && tagsList.length) {
                // make tag array
                var tags = tagsList.split(',');
                for (var i = 0; i < tags.length; i++) {
                    tag = this.trim(tags[i]).toLowerCase();
                    if (tag.length && !tracking[tag]) {
                        newTags.push(tag);
                        tracking[tag] = tag;
                    }
                }
            }

            if (!newTags || !newTags.length) {
                alert('Please enter at least one tag');
                return;
            }

            this.updateVisibleElements();
            this.saveTagsCallback(newTags);
        },

        //

        showTextField: function(placeholder) {
            this.toggleClass(document.getElementById('FLOAT_RECEIVE_OVERLAY_WRAPPER'), 'PKT_SHOW_INPUT', true);
            this.textField = document.getElementById('FLOAT_RECEIVE_OVERLAY_INPUT');
            this.textField.placeholder = placeholder;
            this.updateVisibleElements();
        },

        // 

        toggleClass: function(ele, cls, bool) {
            if (!ele)
                return;

            if (bool && !ele.className.match(cls))
                ele.className += ' ' + cls;
            else if (!bool && ele.className.match(cls))
                ele.className = ele.className.replace(cls, '');
        },

        browserPrefix: function() {
            if (this._prefix)
                return this._prefix;

            var el = document.createElement('div');

            var prefixes = ['Webkit', 'Moz', 'MS', 'O'];
            for (var i in prefixes) {
                if (el.style[prefixes[i] + 'Transition'] !== undefined) {
                    this._prefix = prefixes[i];
                    return this._prefix;
                }
            }
        },

        trim: function(str) {
            var str = str.replace(/^\s\s*/, ''),
                ws = /\s/,
                i = str.length;
            while (ws.test(str.charAt(--i)));
            return str.slice(0, i + 1);
        }

    };


    var FLOAT_RECEIVE = function() {}

    FLOAT_RECEIVE.prototype = {
        init: function() {
            if (this.inited)
                return;

            var self = this;

            this.overlay = new FLOAT_RECEIVE_OVERLAY({
                saveTagsCallback: function(tags) { self.saveTags(tags); }
            });

            this.inited = true;
        },

        isChrome: function() {
            return window["chrome"] != undefined && window.chrome.app;
        },
        isSafari: function() {
            return window["safari"] != undefined;
        },
        addRequestListener: function(listener) {
            if (this.isChrome()) {
                chrome.extension.onMessage.addListener(listener);
            } else if (this.isSafari()) {
                window.safari.self.addEventListener("message", function(thingy) {
                    listener(thingy.message, thingy);
                });
            }
        },
        sendRequest: function(message, cb) {
            if (this.isChrome()) {
                if (window.chrome.extension.sendMessage) {
                    window.chrome.extension.sendMessage(message, cb);
                } else {
                    window.chrome.extension.sendRequest(message, cb);
                }
            } else if (this.isSafari()) {
                if (cb) {
                    message["__cbId"] = Callbacker.addCb(cb);
                }

                safari.self.tab.dispatchMessage("message", message);
            }
        },

        handleResponse: function(response) {
            if (response.status == "success") {
                this.overlay.recieved(response.nickname, response.userid, response.avatarurl, response.sendtime);
            } else if (response.status == "unauthorized") {
                // Not logged in
                this.overlay.hide();
            } else if (response.status == "error") {
                // Tried to use a bookmarklet that was created for a different account
                // TODO : Need to display X-Error in an alert
                this.overlay.hide();
            }
        },

        Recieve: function() {
            var self = this;
            if (this.savingTags) return;

            this.overlay.create();

            if (window.___PKT__URL_TO_SAVE) {
                this.urlToSave = window.___PKT__URL_TO_SAVE;
                window.___PKT__URL_TO_SAVE = undefined;
            }

            var self = this;
            this.addRequestListener(function(request, sender, response) {
                self.handleResponse(request);
            });
        },

        saveTags: function(tags) {
            var self = this;

            this.overlay.displayMessage('Saving Tags');
            this.overlay.showButton(false);

            this.savingTags = true;

            // Make the request here.
            // the tags variable is an array of tags
            // v3/send
            // actions=[action]

            // action = {
            //	action: 'tags_add',
            //	tags: tags,
            //	url: url
            //}

            this.sendRequest({
                action: "addTags",
                tags: tags,
                url: this.urlToSave || window.location.toString()
            }, function() {
                // When completed it is recommend you call something like:
                self.savingTags = false;
                self.overlay.displayMessage('Tags Saved!');
                self.overlay.getReadyToHide();
            });
        }
    }

    if (!window.theFLOAT_RECEIVE) {
        var theFLOAT_RECEIVE = new FLOAT_RECEIVE();
        window.theFLOAT_RECEIVE = theFLOAT_RECEIVE;
        theFLOAT_RECEIVE.init();
    }

    window.theFLOAT_RECEIVE.Recieve();
}
void(0);
//}catch(e){alert(e);}