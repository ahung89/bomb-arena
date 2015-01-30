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
    this.map.setCollision(127);
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

  render: function() {
    if(window.debugging == true) {
      game.debug.body(player);
    }
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
    // Remember - these will actually be executed from the context of the Socket, not from the context of the level.
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
        this.drawExplosion(bomb.x, bomb.y, data.bombStrength);
        bomb.destroy();
      }
    }, level);
  },

  drawExplosion: function(x, y, strength) {
    var strength = 2;
    this.drawIndividualExplosion(x, y, "explosion_center");

    this.drawExplosionInDirection(x, y, 1, 0, strength, "explosion_horizontal", "explosion_right");
    this.drawExplosionInDirection(x, y, -1, 0, strength, "explosion_horizontal", "explosion_left");
    this.drawExplosionInDirection(x, y, 0, 1, strength, "explosion_vertical", "explosion_bottom");
    this.drawExplosionInDirection(x, y, 0, -1, strength, "explosion_vertical", "explosion_top");
  },

  drawExplosionInDirection: function(x, y, xCoefficient, yCoefficient, strength, middleKey, endKey) {
    for(var i = 0; i < strength - 1; i++) {
      var explosionPixelSize = i == 0 ? 30 : 40;
      if(this.drawIndividualExplosion(x + xCoefficient *  ((i + 1) * explosionPixelSize),
         y + yCoefficient * ((i + 1) * explosionPixelSize), middleKey) == false) {
        return;
      }
    }

    this.drawIndividualExplosion(x + xCoefficient * (((strength - 1) * 40) + 30), y + yCoefficient * (((strength - 1) * 40) + 30), endKey);
  },

  drawIndividualExplosion: function(x, y, explosionSpriteKey) {
    if(this.map.getTileWorldXY(x, y) == null || this.map.getTileWorldXY(x, y).index == 127) {
      return false;
    }

    var explosion = new Phaser.Sprite(game, x, y, explosionSpriteKey, 0);
    explosion.anchor.setTo(.5, .5);
    explosion.animations.add("explode");

    game.add.existing(explosion);
    explosion.play("explode", 15, false, true); //framerate 20, no looping, kill on complete
    // TODO: make sure the sprite is actually removed from the game.
  }
};