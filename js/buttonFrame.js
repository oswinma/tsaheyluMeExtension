	$(document).ready(function() {

	    $('#comButton').click(function() {

	        chrome.runtime.sendMessage({ action: 'show' });
	        console.log("comment button click");
	    });

	});