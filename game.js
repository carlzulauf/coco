$(function(){
  window.currentGame = new Game(4, 4);
});

// generates and returns a game object, which keeps track of the game state
var Game = (function(){
  function Game(width, height) {
    this.players = [
      new Player(0),
      new Player(1)
    ];
    this.currentPlayerNumber = 0;
    this.territories = {};
    this.selectedTerritory = null;
    this.board = new GameBoard( this, $("#gameboard") );
    this.reinforcements = 0;

    this.board.setPlayer( this.currentPlayer() );

    // loop through all the rows and columns
    for(var row = 0; row < height; row++) {
      for(var col = 0; col < width; col++) {
        // create a new territory for each cell on the game board
        var id = row + "," + col,
            territory = new Territory(this, row, col);
        this.territories[id] = territory;
        this.board.drawTerritory(territory);
      }
    }

    // place initial armies in top right and bottom left
    this.placeArmies("0,3", 2, this.players[0]);
    this.placeArmies("3,0", 2, this.players[1]);
  }

  var p = Game.prototype;

  p.placeArmies = function(territory_id, armies, player) {
    var territory = this.territories[territory_id];
    territory.armies = armies;
    territory.owner = player;
    this.board.drawTerritory(territory);
  }
  p.currentPlayer = function() {
    return this.players[ this.currentPlayerNumber ];
  }
  p.selectTerritory = function(territory) {
    var player = this.currentPlayer();
    if (this.reinforcements > 0) {
      if (territory.isOwner(player)) {
        this.reinforcements--;
        territory.armies++;
        this.board.drawTerritory(territory);
        if (this.reinforcements > 0) {
          this.board.updateReinforcements(this.reinforcements);
        } else {
          this.nextPlayer();
        }
      }
    } else {
      if (territory.isOwner(player)) {
        if (this.selectedTerritory == territory) {
          this.selectedTerritory = null;
          this.board.unhighlightTerritory(territory);
        } else {
          this.selectedTerritory = territory;
          this.board.highlightTerritory(territory);
        }
      } else if (
          this.selectedTerritory &&
          this.selectedTerritory.isNeighbor(territory) &&
          this.selectedTerritory.armies > 1) {
        this.selectedTerritory.attack(territory);
        this.board.unhighlightTerritory(this.selectedTerritory);
        this.board.drawTerritory(this.selectedTerritory);
        this.board.drawTerritory(territory);
        this.selectedTerritory = null;
      }
    }
  }
  p.endTurn = function() {
    var player = this.currentPlayer();
    this.reinforcements = Object.reduce(this.territories, function(armies, territory) {
      if (territory.owner == player) armies++;
      return armies;
    }, 0);
    this.board.reinforceMode( this.reinforcements );
  }
  p.nextPlayer = function() {
    var i = this.currentPlayerNumber;
    if (this.players[i + 1]) i++;
    else i = 0;
    this.currentPlayerNumber = i;
    this.board.setPlayer( this.currentPlayer() );
    this.board.attackMode();
  }

  return Game;
}());

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

var Territory = (function(){
  function Territory(game, row, col) {
    // set up territory, neighbors, etc
    this.game = game;
    this.armies = 0;
    this.row = row;
    this.col = col;
    this.owner = null;
  }
  p = Territory.prototype;

  p.isOwner = function(player) {
    if (this.owner && this.owner.id == player.id) return true;
    return false;
  }
  p.isNeighbor = function(territory) {
    if (
        (
          this.row == territory.row &&
          Math.abs(this.col - territory.col) == 1
        ) ||
        (
          this.col == territory.col &&
          Math.abs(this.row - territory.row) == 1
        )) {
      return true;
    }
    return false;
  }
  p.attack = function(territory) {
    var mine = this.armies,
        theirs = territory.armies;
    while(mine > 1 && theirs > 0) {
      if (Math.random() > 0.5) {
        theirs--;
      } else {
        mine--;
      }
    }
    if (theirs == 0) {
      this.armies = 1;
      territory.armies = mine - 1;
      territory.owner = this.owner;
    } else {
      this.armies = mine;
      territory.armies = theirs;
    }
  }

  return Territory;
}());

var GameBoard = (function(){
  // constructor
  function GameBoard(game, content) {
    this.game = game;
    this.content = content;
    this.lastHighlight = null;
    this.endTurn = content.find(".end-turn");
    this.reinforcements = content.find(".reinforcements");
    this.reinforcementsCounter = this.reinforcements.find(".counter");

    var that = this;
    this.endTurn.click(function(e){
      e.preventDefault();
      that.game.endTurn();
    });
  }
  var p = GameBoard.prototype;

  // public functions
  p.findCell = function(territory) {
    if (!territory.content) {
      var tr = $( this.content.find("tr")[territory.row] ),
          td = $(           tr.find("td")[territory.col] ),
          that = this;
      td.click(function(e){ that.game.selectTerritory(territory) });
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
  p.highlightTerritory = function(territory) {
    var cell = this.findCell(territory);
    if (this.lastHighlight) this.lastHighlight.css("border", 0);
    cell.css("border", "2px dotted red");
    this.lastHighlight = cell;
  }
  p.unhighlightTerritory = function(territory) {
    this.findCell(territory).css("border", 0);
  }
  p.setPlayer = function(player) {
    var span = this.content.find(".current-player");
    span.text(player.name);
    span.css("background-color", player.getColor());
  }
  p.reinforceMode = function(reinforcements) {
    this.reinforcementsCounter.text(reinforcements);
    this.reinforcements.show();
    this.endTurn.hide();
  }
  p.updateReinforcements = function(reinforcements) {
    this.reinforcementsCounter.text(reinforcements);
  }
  p.attackMode = function() {
    this.reinforcements.hide();
    this.endTurn.show();
  }

  return GameBoard;
}());
