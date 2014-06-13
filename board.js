window.BOARDSIZE=5;

// enum board type
var BoardStatus = {
	SEA : 0,
	SHIP : 1,
	MISS : 2,
	BOOM : 3
};

Board = function() {
	this.playerId=-1;
	this.isOwner=false;
	//this.board[window.BOARDSIZE][window.BOARDSIZE];
	
	//TO-DO find a intuitive way to init 2-d array
	//this.board=new Array(window.BOARDSIZE);
	//for (i=0;i<window.BOARDSIZE;i++ ){
	//	this.board[window.BOARDSIZE]=new Array(window.BOARDSIZE);
	//}
	
	// init 5*5 array
	this.board= [
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
};

Board.prototype = {
	setPlayerId : function(id) {
		this.playerId=id;
	},
	
	getPlayerId : function() {
		return this.playerId;
	},
	
	setIsOwner : function (isOwner){
		this.isOwner=isOwner
	},
	
	getIsOwner : function() {
		return this.isOwner;
	},
	
	setBoardStatus : function( posX, posY, status){
		//this.board[posX][posY]=status;
		this.board[posY][posX]=status;
	},
	
	getBoardStatus : function( posX, posY ){
		//return this.board[posX][posY];
		return this.board[posY][posX];
	},
	
	getBoardEntireStatus : function(){
		var entireStatus = "";
		
		for (i=0;i<window.BOARDSIZE;i++){
			for(j=0;j<window.BOARDSIZE;j++){
				entireStatus+= this.getBoardStatus(i,j).toString();
			}
		}
		
		return entireStatus;
	
	},
	
	importBoard: function( entireStatus ){
		for (i=0;i<entireStatus.length; i++){
			this.setBoardStatus( Math.floor( i/window.BOARDSIZE ), (i % window.BOARDSIZE), parseInt( entireStatus.charAt(i) ));
		}
	},
	
	initBoard : function(){
		for (i=0;i<window.BOARDSIZE;i++){
			for(j=0;j<window.BOARDSIZE;j++){
				this.setBoardStatus( i, j, BoardStatus.SEA);
			}
		}
	},
	
	placeShipOnBoard : function( posX, posY ) {
		//this.setBoardStatus( posX, posY, BoardStatus.SHIP);
		this.setBoardStatus( posY, posX, BoardStatus.SHIP);
	},
	
	throwBomb : function ( posX, posY ){
		//if (this.getBoardStatus( posX, posY ) == BoardStatus.SEA){
		//	this.setBoardStatus(posX, posY, BoardStatus.MISS);
		//}else if(this.getBoardStatus( posX, posY ) == BoardStatus.SHIP){
		//	this.setBoardStatus(posX, posY, BoardStatus.BOOM);
		//}
		
		if (this.getBoardStatus( posY, posX ) == BoardStatus.SEA){
			this.setBoardStatus(posY, posX, BoardStatus.MISS);
		}else if(this.getBoardStatus( posY, posX ) == BoardStatus.SHIP){
			this.setBoardStatus(posY, posX, BoardStatus.BOOM);
		}
	},

}