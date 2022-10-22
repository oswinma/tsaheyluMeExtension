var frameStyleElement = document.createElement('link');
frameStyleElement.href = chrome.runtime.getURL('css/iframe.css');
frameStyleElement.rel = 'stylesheet';
document.querySelector('head').appendChild(frameStyleElement);

var commentFrame = document.createElement("iframe");
var buttonFrame = document.createElement("iframe");
var OverlayFrame = document.createElement("iframe");

commentFrame.src = chrome.runtime.getURL('commentFrame.html');
buttonFrame.src = chrome.runtime.getURL('buttonFrame.html');
OverlayFrame.src = chrome.runtime.getURL('overlayFrame.html');

commentFrame.id = 'tsahayluCommentFrame';
buttonFrame.id = 'tsahayluButtonFrame';
OverlayFrame.id = 'tsahayluOverlayFrame';

console.log("inject.js");

chrome.storage.local.get(["email", "enableCommentBtn"], function(result) {

    var email = result.email
    var enableCommentBtn = result.enableCommentBtn

    if (email && email != "") {
        if (enableCommentBtn == true) {
            if (document.body) {
                document.body.appendChild(buttonFrame);
                document.body.appendChild(commentFrame);
                document.body.appendChild(OverlayFrame);
                // console.log("www.tsahaylu.com");
            }
        }
    }

});

chrome.runtime.onMessage.addListener(function(request, sender, callback) {

    if (request.action == 'show') {
        console.log('show');
        // removeFrame(buttonFrame)
        // document.body.appendChild(commentFrame);
        // document.body.appendChild(OverlayFrame);
        buttonFrame.style.display = 'none';
        commentFrame.style.display = 'block';
        OverlayFrame.style.display = 'block';
    }

    if (request.action == 'hide') {
        console.log('hide');
        // removeFrame(commentFrame);
        // removeFrame(OverlayFrame);
        commentFrame.style.display = 'none';
        OverlayFrame.style.display = 'none';
        buttonFrame.style.display = 'block';
        // document.body.appendChild(buttonFrame);
    }

});


function removeFrame(frame) {

    if (frame && frame.remove) {
        frame.remove();
    }
}