

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
	this.messageBus = this.castReceiverManager.getCastMessageBus(MSG_NAMESPACE,
											cast.receiver.CastMessageBus.MessageType.JSON);
	
	//TO-DO
	// setting callback function
	this.castReceiverManager.onReady = this.ReceiverOnReady.bind(this);
	this.castReceiverManager.onSenderConnected = this.ReceiverOnSenderConnected.bind(this);
	this.castReceiverManager.onSenderDisconnected = this.ReceiverOnSenderDisconnected.bind(this);
	this.messageBus.onMessage=this.MsgBusOnMessage;
	

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
        
	// handler for 'systemvolumechanged' event
	//ReceiverOnSystemVolumeChanged : function(event) {
	//	setMessage('Received System Volume Changed event: ' + event.data['level'] + ' ' +
	//	event.data['muted']);
	//},
	
	//encapsulate the message send function
	sendMessage: function(senderId, message) {
		this.messageBus.send(senderId, message);
	},

	MsgBusOnMessage : function(event) {
		setMessage('Message [' + event.senderId + ']: ' + event.data);
		
		setMessage("Get message: " + JSON.stringify(event.data));
		
		// inform all senders on the CastMessageBus of the incoming message event
		// sender message listener will be invoked
		//this.sendMessage(event.senderId, event.data);
		this.messageBus.broadcast(JSON.stringify(event.data));
	}


};

window.onload = function(){

    window.castReceiver=new CastReceiver();

};


/*
/////////////////////////////////////////////////
// utility function to display the text message in the input field
function displayText(text) {
	setMessage("Get message: " + JSON.stringigy(text));
	window.castReceiverManager.setApplicationState(text);
};

window.onload = function() {
	cast.receiver.logger.setLevelValue(0);
	window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
	setMessage('Starting Receiver Manager');
        
	// handler for the 'ready' event
	castReceiverManager.onReady = function(event) {
		setMessage('Received Ready event: ' + JSON.stringify(event.data));
		window.castReceiverManager.setApplicationState("Application status is ready...");
	};
        
	// handler for 'senderconnected' event
	castReceiverManager.onSenderConnected = function(event) {
		setMessage('Received Sender Connected event: ' + event.data);
		setMessage(window.castReceiverManager.getSender(event.data).userAgent);
	};
        
	// handler for 'senderdisconnected' event
	castReceiverManager.onSenderDisconnected = function(event) {
		setMessage('Received Sender Disconnected event: ' + event.data);
		if (window.castReceiverManager.getSenders().length == 0) {
			window.close();
		}
	};
        
	// handler for 'systemvolumechanged' event
	castReceiverManager.onSystemVolumeChanged = function(event) {
		setMessage('Received System Volume Changed event: ' + event.data['level'] + ' ' +
		event.data['muted']);
	};

	// create a CastMessageBus to handle messages for a custom namespace
	window.messageBus = window.castReceiverManager.getCastMessageBus(MSG_NAMESPACE);

	// handler for the CastMessageBus message event
	window.messageBus.onMessage = function(event) {
		setMessage('Message [' + event.senderId + ']: ' + event.data);
		// display the message from the sender
		displayText(event.data);
		// inform all senders on the CastMessageBus of the incoming message event
		// sender message listener will be invoked
		window.messageBus.send(event.senderId, event.data);
	}

	// initialize the CastReceiverManager with an application status message
	window.castReceiverManager.start({statusText: "Application is starting"});
	setMessage('Receiver Manager started');
};
*/
