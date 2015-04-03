var BLACK_HEX_CODE = "#000000";

var Player = require('../entities/player');
var RemotePlayer = require('../entities/remoteplayer');
var Bomb = require('../entities/bomb');
var RoundEndAnimation = require('../entities/round_end_animation');

var remotePlayers = {};
var gameFrozen = true;

var Level = function () {};

module.exports = Level;

Level.prototype = {
  init: function(tilemapName, players, id) {
    this.tilemapName = tilemapName;
    this.players = players;
    this.playerId = id;
  },

  setEventHandlers: function() {
    // Remember - these will actually be executed from the context of the Socket, not from the context of the level.
    socket.on("disconnect", this.onSocketDisconnect);
    socket.on("move player", this.onMovePlayer);
    socket.on("remove player", this.onRemovePlayer.bind(this));
    socket.on("kill player", this.onKillPlayer);
    socket.on("place bomb", this.onPlaceBomb);
    socket.on("detonate", this.onDetonate.bind(this));
    socket.on("new round", this.onNewRound.bind(this));
    socket.on("end game", this.onEndGame.bind(this));
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

    this.createDimGraphic();
    this.beginRoundAnimation("round_1");
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

    if(player.alive) {
      player.destroy();
    }

    for(var i in remotePlayers) {
      var remotePlayer = remotePlayers[i];
      if(remotePlayer.alive) {
        remotePlayer.destroy();
      }
    }

    this.bombs.removeAll(true);
    remotePlayers = {};
    player = null;
    this.deadGroup = [];
    this.lastFrameTime;
    this.initializePlayers();

    gameFrozen = false;
    socket.emit("ready for round");
  },

  onNewRound: function(data) {
    this.createDimGraphic();
    var datAnimationDoe = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
    gameFrozen = true;


    var roundImage;
    if(data.completedRoundNumber < 2) {
      roundImage = "round_" + (data.completedRoundNumber + 1);
    } else if (data.completedRoundNumber == 2) {
      roundImage = "final_round";
    } else {
      roundImage = "tiebreaker";
    }

    datAnimationDoe.beginAnimation(this.beginRoundAnimation.bind(this, roundImage, this.restartGame.bind(this)));
  },

  onEndGame: function(data) {
    // TODO: Tear down the state.
    this.createDimGraphic();
    gameFrozen = true;
    var animation = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
    animation.beginAnimation(function() {
      game.state.start("GameOver", true, false, data.gameWinnerColor, false);
    });
  },

  beginRoundAnimation: function(image, callback) {
    var beginRoundText = game.add.image(-600, game.camera.height / 2, image);
    beginRoundText.anchor.setTo(.5, .5);

    var tween = game.add.tween(beginRoundText);
    tween.to({x: game.camera.width / 2}, 300).to({x: 1000}, 300, Phaser.Easing.Default, false, 800).onComplete.add(function() {
      this.dimGraphic.destroy();
      gameFrozen = false;

      if(callback) {
        callback();
      }
    }, this);

    tween.start();
  },

  update: function() {
    // End game if all other players have left.
    if(Object.keys(this.players).length == 1) {
      game.state.start("GameOver", true, false, null, true);
    }

    if(player != null && player.alive == true) {
      if(gameFrozen) {
        player.freeze();
      } else {
        player.handleInput();
      }
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
      if(remotePlayer.lastMoveTime < game.time.now - 200) {
        remotePlayer.animations.stop();
      }
    }
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
    this.blockLayer.resizeWorld(); // Set the world size to match the size of this layer.
    this.map.setCollision([127, 361], true, "Blocks");

    // Send map data to server so it can do collisions.
    // TODO: do not allow the game to start until this operation is complete.
    var blockLayerData = game.cache.getTilemapData("levelOne").data.layers[1];

    socket.emit("register map", {tiles: blockLayerData.data, height: blockLayerData.height, width: blockLayerData.width, destructibleTileId: 361});
  },

  onMovePlayer: function(data) {
    if(player && data.id == player.id || gameFrozen) {
      return;
    }

    var movingPlayer = remotePlayers[data.id];

    if(movingPlayer.targetPosition) {
      if(data.x == movingPlayer.targetPosition.x && data.y == movingPlayer.targetPosition.y) {
        return;
      }

      movingPlayer.animations.play(data.facing);

      movingPlayer.position.x = movingPlayer.targetPosition.x;
      movingPlayer.position.y = movingPlayer.targetPosition.y;

      movingPlayer.distanceToCover = {x: data.x - movingPlayer.targetPosition.x, y: data.y - movingPlayer.targetPosition.y};
      movingPlayer.distanceCovered = {x: 0, y:0};
    }

    movingPlayer.targetPosition = {x: data.x, y: data.y};
    movingPlayer.lastMoveTime = game.time.now;
  },

  onRemovePlayer: function(data) {
    var playerToRemove = remotePlayers[data.id];

    playerToRemove.destroy();

    delete remotePlayers[data.id];
    delete this.players[data.id];
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

    data.destroyedTiles.forEach(function(destroyedTile) {
      this.map.removeTile(destroyedTile.col, destroyedTile.row, 1);
    }, this);
  }
};
