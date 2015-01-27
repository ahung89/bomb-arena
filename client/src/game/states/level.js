var Player = require('../entities/Player');
var RemotePlayer = require('../entities/RemotePlayer');
var Bomb = require('../entities/Bomb');

var remotePlayers = {};

var Level = function () {};

module.exports = Level;

Level.prototype = {

  create: function () {
    level = this;
    this.lastFrameTime;

    this.map = game.add.tilemap("levelOne");
    this.map.addTilesetImage("tilez", "tiles", 40, 40);
    this.layer = this.map.createLayer('World');
    this.layer.resizeWorld();

    socket.emit("new player");

    this.bombs = game.add.group();
    game.physics.enable(this.bombs, Phaser.Physics.ARCADE);

    this.setEventHandlers();
  },

  update: function() {
    if(player != null) {
          player.handleInput();
    }

  	this.stopAnimationForMotionlessPlayers();
  	this.storePreviousPositions();

    for(var id in remotePlayers) {
      remotePlayers[id].interpolate(this.lastFrameTime);
    }

    this.lastFrameTime = game.time.now;
  },

  storePreviousPositions: function() {
    for(var id in remotePlayers) {
      remotePlayer = remotePlayers[id];
      remotePlayer.previousPosition = {x: remotePlayer.position.x, y: remotePlayer.position.y};
    }
  },

  stopAnimationForMotionlessPlayers: function() {
    for(var id in remotePlayers) {
      remotePlayer = remotePlayers[id];
      if(remotePlayer.previousPosition.x == remotePlayer.position.x && remotePlayer.previousPosition.y == remotePlayer.position.y) {
        remotePlayer.animations.stop();
      }
    }
  },

  setEventHandlers: function() {
    socket.on("assign id", this.onAssignId);
    socket.on("disconnect", this.onSocketDisconnect);
    socket.on("new player", this.onNewPlayer);
    socket.on("move player", this.onMovePlayer);
    socket.on("remove player", this.onRemovePlayer);
    socket.on("place bomb", this.onPlaceBomb);
    socket.on("detonate", this.onDetonate);
  },

  onAssignId: function(data) {
    console.log("creating new player at " + data.x + ", " + data.y);

    player = new Player(data.x, data.y);
    player.id = data.id;
  },

  onSocketDisconnect: function() {
    console.log("Disconnected from socket server.");

    this.broadcast.emit("remove player", {id: this.id});
  },

  onNewPlayer: function(data) {
    remotePlayers[data.id] = new RemotePlayer(data.x, data.y, data.id);
  },

  onMovePlayer: function(data) {
    if(!player || !player.id || data.id == player.id) {
      return;
    }

    var movingPlayer = remotePlayers[data.id];

    if(movingPlayer.targetPosition) {
      if(data.x == movingPlayer.targetPosition.x && data.y == movingPlayer.targetPosition.y) {
        return;
      }
      movingPlayer.position.x = movingPlayer.targetPosition.x;
      movingPlayer.position.y = movingPlayer.targetPosition.y;

      movingPlayer.distanceToCover = {x: data.x - movingPlayer.targetPosition.x, y: data.y - movingPlayer.targetPosition.y};
      movingPlayer.distanceCovered = {x: 0, y:0};
    }

    movingPlayer.targetPosition = {x: data.x, y: data.y};
    movingPlayer.lastMoveTime = data.timestamp;

    movingPlayer.animations.play(data.facing);
  },

  onRemovePlayer: function(data) {
    var playerToRemove = remotePlayers[data.id];

    playerToRemove.destroy();

    delete remotePlayers[data.id];
  },

  onPlaceBomb: function(data) {
   level.bombs.add(new Bomb(data.x, data.y, data.id));
  },

  onDetonate: function(data) {
    level.bombs.forEach(function(bomb) {
      if(bomb && bomb.id == data.id) {
        bomb.destroy();
      }
    });
  }
};