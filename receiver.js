 

/** @const */
var MSG_NAMESPACE = 'urn:x-cast:com.google.cast.demo.battleship';

// clear the textarea for show status message.
$("#textarea").text();
setMessage= function( message ){
	$("#textarea").append( message  + "\n"  );
    
    // set textarea auto scroll to down
    var textArea = $("#textarea");
    textArea.scrollTop( textArea[0].scrollHeight - textArea.height()  );
};

CastReceiver = function() {
	cast.receiver.logger.setLevelValue(0);

	this.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
	setMessage('Starting Receiver Manager');
	
	// create a CastMessageBus to handle messages for a custom namespace
	this.messageBus = this.castReceiverManager.getCastMessageBus(MSG_NAMESPACE);
	
	//TO-DO
	// setting callback function
	this.castReceiverManager.onReady = this.ReceiverOnReady.bind(this);
	this.castReceiverManager.onSenderConnected = this.ReceiverOnSenderConnected.bind(this);
	this.castReceiverManager.onSenderDisconnected = this.ReceiverOnSenderDisconnected.bind(this);
	this.messageBus.onMessage=this.MsgBusOnMessage.bind(this);
	

	// initialize the CastReceiverManager with an application status message
	this.castReceiverManager.start({statusText: "Application is starting"});
	setMessage('Receiver Manager started');
	
};

CastReceiver.prototype= {

	ReceiverOnReady : function(event){
		setMessage('Received Ready event: ' + JSON.stringify(event.data));
		this.castReceiverManager.setApplicationState("Application status is ready...");
	},
	
	// handler for 'senderconnected' event
	ReceiverOnSenderConnected : function(event) {
		setMessage('Received Sender Connected event: ' + JSON.stringify(event.data));
		setMessage(this.castReceiverManager.getSender(event.data).userAgent);
	},
        
	// handler for 'senderdisconnected' event
	ReceiverOnSenderDisconnected : function(event) {
		setMessage('Received Sender Disconnected event: ' + JSON.stringify(event.data));
		if (this.castReceiverManager.getSenders().length == 0) {
			window.close();
		}
	},
	
	//encapsulate the message send function
	sendMessage: function(senderId, message) {
		this.messageBus.send(senderId, message);
	},

	broadcastMessage: function(message){
		this.messageBus.broadcast(message);
	},

	MsgBusOnMessage : function(event) {
	    setMessage('Get Message [' + event.senderId + ']: ' + event.data);
        
	    var message=JSON.parse(event.data);

	    if (message.command == "join"){
            handleJoin( this, event);
	    }else if (message.command == "setShipComplete"){
            handleSetShipComplete(this, event);
	    }else if(message.command == "moveReply"){
            handleMove(this, event);
        }else{
            setMessage("Unknow command: "+ message);
        }
        
        
	}


};

handleJoin = function(castReceiver, event){
    setMessage("in handle join phase");
      
    // players is enough.
    if (window.playerCount==2){
        setMessage("Game tip: too much player!!");
        return false;
    }
            
    window.playerCount+=1;
    reply=JSON.stringify({'command':"joinReply",
                          'playerId': window.playerCount});
    castReceiver.sendMessage(event.senderId, reply);
    setMessage("Game tip: send a join reply with playerId "+window.playerCount);
            
    // notify players start the ship setting phase.
    if (window.playerCount==2){
        command=JSON.stringify({'command':'startSetShip'});
        castReceiver.broadcastMessage(command)
    }
    
    return true;

};

handleSetShipComplete = function(castReceiver, event){
    setMessage("in handle set ship complete phase.");
    
    var message=JSON.parse(event.data);
    
    
    
    var playerBoard = null;
    if (message.playerId == "1"){
        playerBoard = window.boardui.board1;
    }else if(message.playerId == "2"){
        playerBoard = window.boardui.board2;
    }else {
        setMessage("Unknow playerId: "+ message.playerId+ " on handleSetShipComplete().");
        return false;
    }
    
    // set player board status
    window.playerSetShipCompleteCount++;
    playerBoard.importBoard(message.boardStatus);
    
    // check if all player ready
    if (window.playerSetShipCompleteCount == 2){
        window.boardui.drawUI();

        notifyGameStart(castReceiver);
    
    }
    
    return true;

};

notifyGameStart= function(castReceiver){

    command=JSON.stringify({'command':"gameStart"});
    
    setMessage("Game tip: ready to start the game.");
    
    castReceiver.broadcastMessage(command);
    
    // TO-DO
    // inform player to move
    informPlayerToMove(castReceiver);
    
    return true;

};

informPlayerToMove = function(castReceiver){
    window.playerTurn++;
    
    command=JSON.stringify({'command': "move",
             'playerId': window.playerTurn.toString()});
    castReceiver.broadcastMessage(command);
    
    setMessage("Game tip: player"+window.playerTurn+"'s turn.");
    
    window.playerTurn = window.playerTurn % 2;
    
    return true;

};

handleMove= function(castReceiver, event){
    setMessage("In handle move phase!");
    
    var message=JSON.parse(event.data);
    
    // get the target board to bomb.
    var targetBoard=null;
    var targetPlayerId=null;
    if (message.playerId == "1"){
        targetBoard=window.boardui.board2;
        targetPlayerId="2";
    }else if (message.playerId == "2"){
        targetBoard=window.boardui.board1;
        targetPlayerId="1";
    }else{
        setMessage("Unknown playerId in handleMove()");
        return false;
    }
    
    // throw a bomb
    targetBoard.throwBomb(message.posI, message.posJ);
    window.boardui.changeIcon(targetPlayerId, message.posI, message.posJ);
    
    // broadcast the result to player.
    var resultStatus=targetBoard.getBoardStatus(message.posI, message.posJ);
    command=JSON.stringify({
                    'command':"moveResult",
                    'targetBoard': targetPlayerId,
                    'posI': message.posI,
                    'posJ': message.posJ,
                    'posResult': resultStatus
    });
    
    castReceiver.broadcastMessage(command);
    

    // check win or not
    var result=targetBoard.checkGameOver();
    if (result){
        command=JSON.stringify({
                    'command': "gameOver",
                    'win': message.playerId,
                    'player1': window.boardui.board1.getBoardEntireStatus(),
                    'player2': window.boardui.board2.getBoardEntireStatus()
                    });
        castReceiver.broadcastMessage(command);
        
        // show the board current status
        window.boardui.showAllIcon();
    }
    
    //TO-DO
    // inform another player's turn
    informPlayerToMove(castReceiver)
};


