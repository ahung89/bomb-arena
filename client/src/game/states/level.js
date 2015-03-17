var BLACK_HEX_CODE = "#000000";

var Player = require('../entities/player');
var RemotePlayer = require('../entities/remoteplayer');
var Bomb = require('../entities/bomb');
var RoundEndAnimation = require('../entities/round_end_animation');

var remotePlayers = {};
var disableInputs = false;

var Level = function () {};

module.exports = Level;

Level.prototype = {
  init: function(tilemapName, players, id) {
    this.tilemapName = tilemapName;
    this.players = players;
    this.playerId = id;
  },

  create: function () {
    level = this;
    this.lastFrameTime;
    this.deadGroup = [];

    this.initializeMap();

    this.bombs = game.add.group();
    game.physics.enable(this.bombs, Phaser.Physics.ARCADE);
    game.physics.arcade.enable(this.blockLayer);

    this.setEventHandlers();
    this.initializePlayers();
  },

  createDimGraphic: function() {
    this.dimGraphic = game.add.graphics(0, 0);
    this.dimGraphic.alpha = .7;
    this.dimGraphic.beginFill(BLACK_HEX_CODE, 1); // (color, alpha)
    this.dimGraphic.drawRect(0, 0, game.camera.width, game.camera.height);
    this.dimGraphic.endFill(); // Draw to canvas
  },

  restartGame: function() {
    this.dimGraphic.destroy();
    disableInputs = false;

    if(player.alive) {
      player.destroy();
    }

    for(var i in remotePlayers) {
      var remotePlayer = remotePlayers[i];
      if(remotePlayer.alive) {
        remotePlayer.destroy();
      }
    }

    remotePlayers = {};
    player = null;
    this.deadGroup = [];
    this.lastFrameTime;
    this.initializePlayers();
  },

  onNewRound: function(data) {
    this.createDimGraphic();
    var datAnimationDoe = new RoundEndAnimation(game, data.completedRound, data.winningColors);
    disableInputs = true;
    datAnimationDoe.beginAnimation(this.beginRoundAnimation.bind(this, "round_" + (data.completedRound + 1), 
      this.restartGame.bind(this)));
  },

  // TODO: Figure out how this will know which animation to play.
  beginRoundAnimation: function(image, callback) {
    var beginRoundText = game.add.image(-600, game.camera.height / 2, image);
    beginRoundText.anchor.setTo(.5, .5);

    var tween = game.add.tween(beginRoundText);
    tween.to({x: game.camera.width / 2}, 300).to({x: 1000}, 300, null, false, 800).onComplete.add(function() {
      // For some reason, the callback sent to "onComplete" fires BEFORE the 800 second delay. This is a hack to get around that.
      game.time.events.add(1100, callback);
    });

    tween.start();
  },

  update: function() {
    if(player != null && player.alive == true && !disableInputs) {
          player.handleInput();
    }

  	this.stopAnimationForMotionlessPlayers();
  	this.storePreviousPositions();

    for(var id in remotePlayers) {
      remotePlayers[id].interpolate(this.lastFrameTime);
    }

    this.lastFrameTime = game.time.now;

    this.destroyDeadSprites();
  },

  destroyDeadSprites: function() {
    level.deadGroup.forEach(function(deadSprite) {
      deadSprite.destroy();
    });
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
    socket.on("disconnect", this.onSocketDisconnect);
    socket.on("move player", this.onMovePlayer);
    socket.on("remove player", this.onRemovePlayer);
    socket.on("kill player", this.onKillPlayer);
    socket.on("place bomb", this.onPlaceBomb);
    socket.on("detonate", this.onDetonate);
    socket.on("new round", this.onNewRound.bind(this));
  },

  onSocketDisconnect: function() {
    console.log("Disconnected from socket server.");

    this.broadcast.emit("remove player", {id: this.id});
  },

  initializePlayers: function() {
    for(var i in this.players) {
      var data = this.players[i];
      if(data.id == this.playerId) {
        player = new Player(data.x, data.y, data.id, data.color);
      } else {
        remotePlayers[data.id] = new RemotePlayer(data.x, data.y, data.id, data.color);
      }
    }
  },

  initializeMap: function() {
    this.map = game.add.tilemap(this.tilemapName);
    this.map.addTilesetImage("tilez", "tiles", 40, 40);

    this.groundLayer = this.map.createLayer("Ground");
    this.groundLayer.resizeWorld();
    this.blockLayer = this.map.createLayer("Blocks");
    this.blockLayer.resizeWorld(); // What does this do?

    this.map.setCollision(127, true, "Blocks");

    // Send map data to server so it can do collisions.
    // TODO: do not allow the game to start until this operation is complete.
    var blockLayerData = game.cache.getTilemapData("levelOne").data.layers[1];

    socket.emit("register map", {tiles: blockLayerData.data, height: blockLayerData.height, width: blockLayerData.width});
  },

  onMovePlayer: function(data) {
    if(player && data.id == player.id) {
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

  onKillPlayer: function(data) {
    if(data.id == player.id) {
      console.log("You've been killed.");

      player.destroy();
    } else {
      var playerToRemove = remotePlayers[data.id];

      playerToRemove.destroy();

      delete remotePlayers[data.id];
    }
  },

  onPlaceBomb: function(data) {
   level.bombs.add(new Bomb(data.x, data.y, data.id));
  },

  onDetonate: function(data) {
    Bomb.renderExplosion(data.explosions);

    //remove bomb from group. bombs is a Phaser.Group to make collisions easier.
    level.bombs.forEach(function(bomb) {
      if(bomb && bomb.id == data.id) {
        bomb.destroy();
      }
    }, level);
  }
};
