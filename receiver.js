

/** @const */
var MSG_NAMESPACE = 'urn:x-cast:com.google.cast.demo.battleship';

// clear the textarea for show status message.
$("#textarea").text();
setMessage= function( message ){
	$("#textarea").append( message  + "\n"  );
};

// utility function to display the text message in the input field
function displayText(text) {
	setMessage(text);
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
        window.messageBus =
          window.castReceiverManager.getCastMessageBus(
              'urn:x-cast:com.google.cast.sample.helloworld');

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
