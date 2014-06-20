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
   
    message=JSON.parse(messageString);

    if (message.command == "joinReply"){
        handleJoinReply(message);
    }else if(message.command == "startSetShip"){
        startSetShip();
    }else if(message.command == "gameStart"){
        prepareToStart();
    }else if(message.command == "move"){
        prepareToMove(message);
    }else if(message.command == "moveResult" ){
        showMoveResult(message);
    }

    //if(messageString['command'] == "joinReply"){
    //    handleJoinReply(messageString);
    //}else if(messageString['command']=="startSetShip"){
    //    setMessage("aaaaaaaaaaaaa");
	
    //	startSetShip();
    //}
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
    
   // if (replyMessage['playerId']== '1'){
    if (replyMessage.playerId == "1"){
	window.playerId='1';
    
        window.b1.setPlayerId("1");
        window.b1.setIsOwner(true);
        
        window.b1.setPlayerId("2");
        window.b1.setIsOwner(false);
        
        setMessage("Game tip: Your the the player 1");
    //}else if(replyMessage['playerId']== '2'){
    }else if (replyMessage.playerId == "2"){
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
    var playerBoard=null;
    if( window.playerId == '1'){
        playerBoard=window.boardui.board1;
    }else if(window.playerId == '2'){
        playerBoard=window.boardui.board2;
    }else{
        setMessage("Unknow player id: " + window.playerId);
        return false;
    }
    
    // check if ship is out of bound.
    var currentShipAlreadySet=playerBoard.getCurrentShipCount();
    if (currentShipAlreadySet >= window.MAXSHIPCOUNT){
        setMessage("Ships already full. please wait!!");
        return false;
    }
        
    //check select position is a valid position.
    currentStatus=playerBoard.getBoardStatus(i,j);
    if(currentStatus != BoardStatus.SEA){
        setMessage("Not a valid position at ("+i+","+j+")");
        return false;
    }
        
    // set position as ship, and change the icon.
    playerBoard.placeShipOnBoard(i,j);
    currentShipAlreadySet++;
    playerBoard.setCurrentShipCount(currentShipAlreadySet);
    window.boardui.changeIcon(window.playerId, i, j);
        
    // if ships already reach the MAX, notify the receiver. 
    if (currentShipAlreadySet == window.MAXSHIPCOUNT){
        command={'command':"setShipComplete",
                'playerId': window.playerId,
                'boardStatus': playerBoard.getBoardEntireStatus()};
           
        window.castSender.sendMessage(command);
    }
        
    return true;
        
    /*if( window.playerId == '1'){
        var playerBoard=window.b1;
        
        // check if ship is out of bound.
        var currentShipAlreadySet=playerBoard.getCurrentShipCount();
        if (currentShipAlreadySet >= window.MAXSHIPCOUNT){
            setMessage("Ships already full. please wait!!");
            return false;
        }
        
        //check select position is a valid position.
        currentStatus=playerBoard.getBoardStatus(i,j);
        if(currentStatus != BoardStatus.SEA){
            setMessage("Not a valid position at ("+i+","+j+")");
            return false;
        }
        
        // set position as ship, and change the icon.
        playerBoard.placeShipOnBoard(i,j);
        currentShipAlreadySet++;
        playerBoard.setCurrentShipCount(currentShipAlreadySet);
        //window.boardui.setIconAsShip("player"+window.playerId+"_"+i+j);
        window.boardui.changeIcon(window.playerId, i, j);
        
        // if ships already reach the MAX, notify the receiver. 
        if (currentShipAlreadySet == window.MAXSHIPCOUNT){
            command={'command':"setShipComplete",
                     'playerId': window.playerId,
                     'boardStatus': playerBoard.getBoardEntireStatus()};
            
            window.castSender.sendMessage(command);
        }
        
        return true;
        
    }else if(window.playerId == '2'){
    
        var playerBoard=window.b2;
        
        // check if ship is out of bound.
        var currentShipAlreadySet=playerBoard.getCurrentShipCount();
        if (currentShipAlreadySet >= window.MAXSHIPCOUNT){
            setMessage("Ships already full. please wait!!");
            return false;
        }
        
        //check select position is a valid position.
        currentStatus=playerBoard.getBoardStatus(i, j);
        if(currentStatus != BoardStatus.SEA){
            setMessage("Not a valid position at ("+i+","+j+")");
            return false;
        }
        
        // set position as ship, and change the icon.
        playerBoard.placeShipOnBoard(i,j);
        currentShipAlreadySet++;
        playerBoard.setCurrentShipCount(currentShipAlreadySet);
        //window.boardui.setIconAsShip("player"+window.playerId+"_"+i+j);
        window.boardui.changeIcon(window.playerId, i, j);
        
        // if ships already reach the MAX, notify the receiver. 
        if (currentShipAlreadySet == window.MAXSHIPCOUNT){
            command={'command':"setShipComplete",
                     'playerId': window.playerId,
                     'boardStatus': playerBoard.getBoardEntireStatus()};
            
            window.castSender.sendMessage(command);
        }
        
        return true;
    
    
    }else{
        setMessage("Unknow player id: " + window.playerId);
        
        return false;
    }*/
    

};

testThrowBomb = function(i, j){
    
    //  get competitor board
    var competitorBoard=null;
    if (window.playerId == "1"){
        competitorBoard=window.boardui.board2;
    }else if(window.playerId == "2"){
        competitorBoard=window.boardui.board1;
    }
    
    // test position is not bombed yet.
    var currentStatus=competitorBoard.getBoardStatus(i, j);
    if ( currentStatus != BoardStatus.SEA){
        // In the player's vision, they don't know where the ship is.
        // if this position status is unknown, that will be SEA.
        alert("Not a valid position, please choose another!");
        return  false;
    }
    
    

    
    command=JSON.stringify({
                    'command': "moveReply",
                    'playerId': window.playerId,
                    'posI': i.toString(),
                    'posJ': j.toString()});
    window.castSender.sendMessage(command);              
    
    // disable all click event for waiting another.
    window.boardui.disableClickEvent(window.playerId);

}

startSetShip = function(){
    setMessage("Game tip: please set "+window.MAXSHIPCOUNT+" ships!");
    window.boardui.combineUIAndSetShip();
	    
};

prepareToStart = function(){
    setMessage("Game tip: prepare to start the game.");
    window.boardui.disableClickEvent(window.playerId);

}; 

prepareToMove = function(message){
    
    if (message.playerId == window.playerId){
        setMessage("Game tip: Your turn.");
    }else{
        setMessage("Game tip: player"+message.playerId+"'s turn, please wait.");
    }
    
    window.boardui.combineUIAndThrowBomb();

};

showMoveResult = function(message){

    // get target board
    var targetBoard = null;
    if (message.targetBoard == "1"){
        targetBoard=window.boardui.board1;
    }else if(message.targetBoard == "2"){
        targetBoard=window.boardui.board2;
    }else{
        setMessage("Unknow target board in showMoveResult.");
        return false;
    }
    
    // update position status
    targetBoard.setBoardStatus(message.posI, message.posJ, message.posResult);
    window.boardui.changeIcon(message.targetBoard, message.posI, message.posJ);
    
};
