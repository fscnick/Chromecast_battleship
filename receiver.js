

/** @const */
var MSG_NAMESPACE = 'urn:x-cast:com.google.cast.demo.battleship';

// clear the textarea for show status message.
$("#textarea").text();
setMessage= function( message ){
	$("#textarea").append( message  + "\n"  );
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
		setMessage('Message [' + event.senderId + ']: ' + event.data);
		
		setMessage("Get message: " + JSON.stringify(event.data));
		
		// inform all senders on the CastMessageBus of the incoming message event
		// sender message listener will be invoked
		//this.sendMessage(event.senderId, event.data);
		//this.broadcastMessage(event.data);
        
        if (event.data['command']== "join"){
            
            window.playerCount+=1;
            if (window.playerCount>2){
                setMessage("Game tip: too much player!!");
                return;
            }
            reply={'command':"joinReply",
                    'playerId': window.playerCount};
            
            this.sendMessage(event.senderId, reply);
            setMessage("Game tip: send a join reply with playId "+window.playerCount);
        
        }
        
        
	}


};

window.onload = function(){

    window.castReceiver=new CastReceiver();

};

