$(document).ready(function(){

		$('#overlay').click(function(){
		chrome.runtime.sendMessage({action:'hide'});
	});
	
});