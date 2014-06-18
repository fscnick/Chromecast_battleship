window.BOARDSIZE=5;
window.MAXSHIPCOUNT=window.BOARDSIZE;

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
    this.currentShipCount=0;
    
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
	getBoardLength: function(){
		return this.board.length;
	},

	setPlayerId : function(palyerId) {
		this.playerId=palyerId;
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
    
    setCurrentShipCount: function(count){
        this.currentShipCount=count;
    },
    
    getCurrentShipCount: function(){
        return this.currentShipCount;
    },
	
	setBoardStatus : function( i, j, status){
		//this.board[posX][posY]=status;
		this.board[i][j]=status;
	},
	
	getBoardStatus : function( i, j ){
		//return this.board[posX][posY];
		return this.board[i][j];
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
	
	placeShipOnBoard : function( i, j ) {
		//this.setBoardStatus( posX, posY, BoardStatus.SHIP);
		this.setBoardStatus( i, j, BoardStatus.SHIP);
	},
	
	throwBomb : function ( i, j ){
		//if (this.getBoardStatus( posX, posY ) == BoardStatus.SEA){
		//	this.setBoardStatus(posX, posY, BoardStatus.MISS);
		//}else if(this.getBoardStatus( posX, posY ) == BoardStatus.SHIP){
		//	this.setBoardStatus(posX, posY, BoardStatus.BOOM);
		//}
		
		if (this.getBoardStatus( i, j ) == BoardStatus.SEA){
			this.setBoardStatus(i, j, BoardStatus.MISS);
		}else if(this.getBoardStatus( i, i ) == BoardStatus.SHIP){
			this.setBoardStatus(i, i, BoardStatus.BOOM);
		}
	},

}

BoardUI= function(board1, board2){
	this.board1=board1;
	this.board2=board2;
	
	//TO-DO init array from this.board.getBoardLength()
	this.board1CanModify=[
		[true,true,true,true,true],
		[true,true,true,true,true],
		[true,true,true,true,true],
		[true,true,true,true,true],
		[true,true,true,true,true]
	];
	
	this.board2CanModify=[
		[true,true,true,true,true],
		[true,true,true,true,true],
		[true,true,true,true,true],
		[true,true,true,true,true],
		[true,true,true,true,true]
	];
	
};

BoardUI.prototype= {
	drawUI: function(){
	
		// set players board wrapper
		$("#textarea").after("<br>\n"+
								"<div id='boardUI'>\n"+
								"</div>")
		wrapWidth=(this.board1.getBoardLength()*2*100)+100;
		wrapHeight=(this.board1.getBoardLength()*100)+100;
		$("#boardUI").css({'width': wrapWidth.toString()+'px', 
							'height': wrapHeight.toString()+'px',
							'margin': "0 auto"});
		
		// set palyer board column
		$("#boardUI").append("<div id='player1'></div>"+
								"<div id='player2'></div>");
								
		columnWidth=this.board1.getBoardLength()*100;
		$("#player1").css({ 'width': columnWidth.toString(),
							'height':wrapHeight.toString()+'px', 
							'float': "left"});
		$("#player2").css({ 'width': columnWidth.toString(), 
							'height':wrapHeight.toString()+'px', 
							'float': "right"});
		
		$("#player1").append("<h1>player1</h1><br>");
		$("#player2").append("<h1>player2</h1><br>");

		for (i=0;i<window.BOARDSIZE;i++){
			for (j=0;window.BOARDSIZE;j++){
				$("#player1").append("<input type='image'"+"id='player1_"+i+j+"' src='picture/point.jpg'>");
				$("#player2").append("<input type='image'"+"id='player2_"+i+j+"' src='picture/point.jpg'>");
			}
			$("#player1").append("<br>");
			$("#player2").append("<br>");
		}
		
	},
    
    setIconAsShip: function(iconTagID){
        $("#"+iconTagID).attr("src","picture/point.jpg");
    },
    
    combineUIAndSetShip: function(){
    
        // which board will be set, player1 or player2 .
        var playerIdPrefix="player"+window.playerId+"_";
        
        for(i = 0; i < window.MAXSHIPCOUNT ;i++){
            for(j = 0; j < window.MAXSHIPCOUNT;j++){
                $("#"+playerIdPrefix+i+j).click( function() {
                    testAndSetShip(i,j);  
                });
            }
        }

    }
    
    

};
