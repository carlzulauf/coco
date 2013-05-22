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

  this.board.setPlayer( this.currentPlayer() );

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
  this.placeArmies("0,3", 2, this.players[0]);
  this.placeArmies("3,0", 2, this.players[1]);
}
Game.prototype.placeArmies = function(territory_id, armies, player) {
  var territory = this.territories[territory_id];
  territory.armies = armies;
  territory.owner = player;
  this.board.drawTerritory(territory);
}
Game.prototype.currentPlayer = function() {
  return this.players[ this.currentPlayerNumber ];
}

var Player = (function(){
  var colors = ["green", "blue", "red", "orange"];
  function Player(num) {
    this.id = num;
    this.num = num;
    this.name = "Player " + (num + 1);
  }
  Player.prototype.getColor = function() {
    return colors[this.num];
  }
  return Player;
}());

function Territory(row, col) {
  // set up territory, neighbors, etc
  this.armies = 0;
  this.row = row;
  this.col = col;
  this.owner = null;
}

var GameBoard = (function(){
  // constructor
  function board(content) {
    this.content = content;
  }
  var p = board.prototype;

  // public functions
  p.findCell = function(territory) {
    if (!territory.content) {
      var tr = $( this.content.find("tr")[territory.row] ),
          td = $(           tr.find("td")[territory.col] );
      td.click(function(e){
        td.css("background-color", "red");
      });
      territory.content = td;
    }
    return territory.content;
  }
  p.drawTerritory = function(territory) {
    var cell = this.findCell(territory);
    if (territory.armies > 0) text = territory.armies + "";
    else text = "[]";
    cell.text(text);
    if (territory.owner) {
      cell.css("background-color", territory.owner.getColor());
    }
  }
  p.setPlayer = function(player) {
    this.content.find(".current-player").text(player.name);
  }

  return board;
}());
