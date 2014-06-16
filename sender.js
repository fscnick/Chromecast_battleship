

/** @const */
var MSG_NAMESPACE = 'urn:x-cast:com.google.cast.demo.battleship';
var APP_ID = 'BDF10103';
window.castObj=null;

update = function () {
		window.castObj.sendMessage($("#inputText").val());
};

CastSender = function() {
	
	this.session=null;
};

setMessage	= function( message ){
	$("#textarea").append( message + "\n" );
};

CastSender.prototype.ChannelOnReceiverMessage = function( namespace, messageString ){
	
	setMessage("Success Message receive: " + JSON.stringify(message));
	

}

CastSender.prototype.sendMessageOnSuccess = function (message){
	setMessage("Success Message sent: " + JSON.stringify(message));
};

CastSender.prototype.sendMessageOnError = function (message){
	setMessage("Error Message sent: " + JSON.stringify(message));
};

CastSender.prototype.sendMessage = function(message){
	if (this.session!=null) {
		this.session.sendMessage(MSG_NAMESPACE, message, this.sendMessageOnSuccess(message), this.sendMessageOnError.bind(this));
	}
	else {
    /*chrome.cast.requestSession(function(e) {
        window.session_ = e;
        window.session_.sendMessage(MSG_NAMESPACE, message, sendMessageOnSuccess, sendMessageOnError);
      }, onError);*/
	  setMessage("Error mEssage sent: Session is null, please connect to reciever first.");
	}
};

CastSender.prototype.sessionUpdateListener = function(isAlive) {
	var message = isAlive ? 'Session Updated' : 'Session Removed';
	message += ': ' + this.session.sessionId;
	setMessage(message);
	
	if (!isAlive) {
		this.session = null;
	}
};

CastSender.prototype.onReceiverMessage = function(namespace, messageString) {
	setMessage("Got message: " + namespace + " " + messageString);
};

CastSender.prototype.sessionListener = function(e)	{
	setMessage('New session ID: ' + e.sessionId);
	
	// save it as a global variable
	this.session = e;
	
	e.addUpdateListener(this.sessionUpdateListener.bind(this));
	e.addMessageListener(MSG_NAMESPACE, this.onReceiverMessage.bind(this));
};

CastSender.prototype.receiverListener = function(e) {
	setMessage('receiver listener: ' + e);
};

CastSender.prototype.onInitSuccess = function() {
	setMessage("onInitSuccess");
};

CastSender.prototype.onError = function(message) {
	setMessage("onError: "+JSON.stringify(message));
};

CastSender.prototype.initializeCastApi = function() {

	//if chrome.cast is not loaded yet, retry after 1 sec..
	if (!chrome.cast || !chrome.cast.isAvailable) {
		setTimeout(this.initializeCastApi.bind(this), 1000);
		return;
	}

	// init the connection
	var sessionRequest = new chrome.cast.SessionRequest(APP_ID);
	var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
												this.sessionListener.bind(this),
												this.receiverListener.bind(this));
	chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.onError.bind(this));
};

window['__onGCastApiAvailable'] = (function(loaded, errorInfo) {
	if (loaded) {
		window.castObj= new CastSender();
		window.castObj.initializeCastApi();
    } else {
		setMessage("Init Error: "+JSON.stringify(errorInfo));
    }
});


/*
///////////////////////////////////////////////////////////////////
// clear the textarea for show status message.
$("#textarea").text();
setMessage= function( message ){
	$("#textarea").append( message + "\n" );
};

update =function () {
	sendMessage($("#inputText").val());
};

sendMessageOnSuccess = function (message){
	setMessage("Success Message sent: " + JSON.stringify(message));
};

sendMessageOnError = function (message){
	setMessage("Error Message sent: " + JSON.stringify(message));
};





sendMessage = function(message){
	if (window.session_!=null) {
		window.session_.sendMessage(MSG_NAMESPACE, message, sendMessageOnSuccess(message), sendMessageOnError);
	}
	else {
    //chrome.cast.requestSession(function(e) {
    //   window.session_ = e;
    //    window.session_.sendMessage(MSG_NAMESPACE, message, sendMessageOnSuccess, sendMessageOnError);
    //  }, onError);
	  setMessage("Error mEssage sent: Session is null, please connect to reciever first.");
	}
};

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

*/
