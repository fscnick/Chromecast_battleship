

/** @const */
var MSG_NAMESPACE = 'urn:x-cast:com.google.cast.demo.battleship';
var APP_ID = 'BDF10103';
window.castSender=null;
window.playerId="None";

update = function () {
		window.castSender.sendMessage($("#inputText").val());
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
    }else if(message['command']=="startSetShip"){
        startSetShip();
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
    command={'command': 'join',
             'playerId': 'None'};
             
    castSender.sendMessage(command);
    
};

handleJoinReply = function(replyMessage) {

    if (replyMessage['playerId']== '1'){
        window.playerId='1';
    
        window.b1.setPlayerId("1");
        window.b1.setIsOwner(true);
        
        window.b1.setPlayerId("2");
        window.b1.setIsOwner(false);
        
        setMessage("Game tip: Your the the player 1");
    }else if(replyMessage['playerId']== '2'){
        window.playerId='2';
        
        window.b1.setPlayerId("1");
        window.b1.setIsOwner(false);
        
        window.b1.setPlayerId("2");
        window.b1.setIsOwner(true);
        
        setMessage("Game tip: Your the the player 2");
    }else{
        setMessage("Game tip: unknow reply on JoinReply!!");
    
    }
    
    // after get join reply, sender wait receiver broadcast to ship setting phase
};

testAndSetShip= function(i,j){
    if( window.playerId == '1'){
        var playerBoard=window.b1
        
        // check if ship is out of bound.
        var currentShipAlreadySet=playerBoard.getCurrentShipCount();
        if (currentShipAlreadySet >= window.MAXSHIPCOUNT){
            setMessage("Ships already full. please wait!!");
            return false;
        }
        
        //check select position is a valid position.
        currentStatus=playerBoard.getBoardStatus();
        if(currentStatus != BoardStatus.SEA){
            setMessage("Not a valid position at ("+i+","+j+")");
            return false;
        }
        
        // set position as ship, and change the icon.
        playerBoard.placeShipOn(i,j);
        currentShipAlreadySet++;
        playerBoard.setCurrentShipCount(currentShipAlreadySet);
        window.boardui.setIconAsShip("player1"+window.playerId+"_"+i+j);
        
        // if ships already reach the MAX, notify the receiver. 
        if (currentShipAlreadySet == window.MAXSHIPCOUNT){
            command={'command':"setShipComplete".
                     'playerId': window.playerId,
                     'boardStatus': playerBoard.getBoardEntireStatus()};
            
            window.castSender(command);
        }
        
        return true;
        
    }else if(window.playerId == '2'){
    
        var playerBoard=window.b2
        
        // check if ship is out of bound.
        var currentShipAlreadySet=playerBoard.getCurrentShipCount();
        if (currentShipAlreadySet >= window.MAXSHIPCOUNT){
            setMessage("Ships already full. please wait!!");
            return false;
        }
        
        //check select position is a valid position.
        currentStatus=playerBoard.getBoardStatus();
        if(currentStatus != BoardStatus.SEA){
            setMessage("Not a valid position at ("+i+","+j+")");
            return false;
        }
        
        // set position as ship, and change the icon.
        playerBoard.placeShipOn(i,j);
        currentShipAlreadySet++;
        playerBoard.setCurrentShipCount(currentShipAlreadySet);
        window.boardui.setIconAsShip("player"+window.playerId+"_"+i+j);
        
        // if ships already reach the MAX, notify the receiver. 
        if (currentShipAlreadySet == window.MAXSHIPCOUNT){
            command={'command':"setShipComplete".
                     'playerId': window.playerId,
                     'boardStatus': playerBoard.getBoardEntireStatus()};
            
            window.castSender(command);
        }
        
        return true;
    
    
    }else{
        setMessage("Unknow player id: " + window.playerId);
        
        return false;
    }
    
    
    

}

startSetShip = function(){
    setMessage("Game tip: please set "+window.MAXSHIPCOUNT+" ships!");
    window.boardui.combineUIAndSetShip();
    
};
