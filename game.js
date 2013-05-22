$(function(){
  window.currentGame = new Game(4, 4);
});

// generates and returns a game object, which keeps track of the game state
function Game(width, height) {
  this.players = [
    new Player(0),
    new Player(1)
  ];
  this.currentPlayerNumber = 0;
  this.territories = {};
  this.board = new GameBoard( $("#gameboard") );

  // loop through all the rows and columns
  for(var row = 0; row < height; row++) {
    for(var col = 0; col < width; col++) {
      // create a new territory for each cell on the game board
      var id = row + "," + col,
          territory = new Territory(row, col);
      this.territories[id] = territory;
      this.board.drawTerritory(territory);
    }
  }

  // place initial armies in top right and bottom left
  this.placeArmies("0,3", 2);
  this.placeArmies("3,0", 2);
}
Game.prototype.placeArmies = function(territory_id, armies) {
  var territory = this.territories[territory_id];
  territory.armies = armies;
  this.board.drawTerritory(territory);
}

function Player(num) {
  this.id = num;
  this.num = num;
}

function Territory(row, col) {
  // set up territory, neighbors, etc
  this.armies = 0;
  this.row = row;
  this.col = col;
  this.owner = null;
}

function GameBoard(content) {
  // setup game board
  this.content = content;
}
GameBoard.prototype.drawTerritory = function(territory) {
  var tr = $( this.content.find("tr")[territory.row] ),
      td = $(           tr.find("td")[territory.col] ),
      text;
  if (territory.armies > 0) text = territory.armies + "";
  else text = "[]";
  td.text(text);
}
