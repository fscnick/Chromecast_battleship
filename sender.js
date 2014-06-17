

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

CastSender.prototype.sendMessageOnSuccess = function (message){
	setMessage("Success Message sent: " + JSON.stringify(message));
    
    if (message['command']== "join"){
        setMessage("Game tip: Send the join message, wait another player!!");
    }
};

CastSender.prototype.sendMessageOnError = function (message){
	setMessage("Error Message sent: " + JSON.stringify(message));
    
    if (message['command']== "join"){
        setMessage("Game tip: Send the join message, but error on sending.");
    } 
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
    
    if(messageString['command'] == "joinReply"){
        handleJoinReply(messageString);
    }
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


join = function(castSender){
    message={'command': 'join',
             'playerId': 'None'};
             
    castSender.sendMessage(message);
    
};

handleJoinReply = function(replyMessage) {

    if (replyMessage['playerId']== '1'){
        window.b1.setPlayerId("1");
        window.b1.setIsOwner(true);
        
        window.b1.setPlayerId("2");
        window.b1.setIsOwner(false);
        
        setMessage("Game tip: Your the the player 1");
    }else if(replyMessage['playerId']== '1'){
        window.b1.setPlayerId("1");
        window.b1.setIsOwner(false);
        
        window.b1.setPlayerId("2");
        window.b1.setIsOwner(true);
        
        setMessage("Game tip: Your the the player 2");
    }else{
        setMessage("Game tip: unknow reply on JoinReply!!");
    
    }
};