

/** @const */
var MSG_NAMESPACE = 'urn:x-cast:com.google.cast.demo.battleship';
var APP_ID = 'BDF10103';

// clear the textarea for show status message.
$("#textarea").text();
setMessage= function( message ){
	$("#textarea").append( message );
};

update =function () {
	sendMessage($("#inputText").text());
};

sendMessage = function(message){
	if (window.session_!=null) {
    window.session_.sendMessage(namespace, message, onSuccess.bind(this, "Message sent: " + message), onError);
  }
  else {
    chrome.cast.requestSession(function(e) {
        window.session_ = e;
        window.session_.sendMessage(namespace, message, onSuccess.bind(this, "Message sent: " + message), onError);
      }, onError);
  }


}

sessionUpdateListener_ = function(isAlive) {
	var message = isAlive ? 'Session Updated' : 'Session Removed';
	message += ': ' + this.session_.sessionId;
	setMessage(message);
	
	if (!isAlive) {
    window.session_ = null;
  }
  
};

onReceiverMessage_ = function(namespace, messageString) {
	setMessage('Got message: ' +
                      namespace + ' ' +
                      messageString);
};

sessionListener_ = function(e)	{
	setMessage('New session ID: ' + e.sessionId);
	
	// save it as a global variable
	window.session_ = e;
	
	e.addUpdateListener(sessionUpdateListener_);
	e.addMessageListener(MSG_NAMESPACE, onReceiverMessage_);
};

receiverListener_ = function(e) {
	setMessage('receiver listener: ' + e);
};

onInitSuccess = function() {
  setMessage("onInitSuccess");
};

onError = function(message) {
  setMessage("onError: "+JSON.stringify(message));
};

initializeCastApi = function() {
  var sessionRequest = new chrome.cast.SessionRequest(APP_ID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
											sessionListener_,
											receiverListener_);
  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
  if (loaded) {
    initializeCastApi();
  } else {
    setMessage( JSON.stringify(errorInfo) )
  }
};

if (!chrome.cast || !chrome.cast.isAvailable) {
  setTimeout(initializeCastApi, 1000);
}


