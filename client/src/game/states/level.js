var BLACK_HEX_CODE = "#000000";
var TILE_SIZE = 40;

var PowerupIDs = require("../../../../common/powerup_ids");
var MapInfo = require("../../../../common/map_info");
var AudioPlayer = require("../util/audio_player");
var Player = require("../entities/player");
var RemotePlayer = require("../entities/remoteplayer");
var Bomb = require("../entities/bomb");
var RoundEndAnimation = require("../entities/round_end_animation");
var PowerupImageKeys = require("../util/powerup_image_keys");
var PowerupNotificationPlayer = require("../util/powerup_notification_player");

var Level = function () {};

module.exports = Level;

Level.prototype = {
  remotePlayers: {},

  gameFrozen: true,

  init: function(tilemapName, players, id) {
    this.tilemapName = tilemapName;
    this.players = players;
    this.playerId = id;
  },

  setEventHandlers: function() {
    // Remember - these will actually be executed from the context of the Socket, not from the context of the level.
    socket.on("disconnect", this.onSocketDisconnect);
    socket.on("m", this.onMovePlayer.bind(this));
    socket.on("remove player", this.onRemovePlayer.bind(this));
    socket.on("kill player", this.onKillPlayer.bind(this));
    socket.on("place bomb", this.onPlaceBomb.bind(this));
    socket.on("detonate", this.onDetonate.bind(this));
    socket.on("new round", this.onNewRound.bind(this));
    socket.on("end game", this.onEndGame.bind(this));
    socket.on("no opponents left", this.onNoOpponentsLeft.bind(this));
    socket.on("powerup acquired", this.onPowerupAcquired.bind(this));
  },

  create: function () {
    level = this;
    this.lastFrameTime;
    this.deadGroup = [];

    this.initializeMap();

    this.bombs = game.add.group();
    this.items = {};
    game.physics.enable(this.bombs, Phaser.Physics.ARCADE);
    game.physics.arcade.enable(this.blockLayer);

    this.setEventHandlers();
    this.initializePlayers();

    this.createDimGraphic();
    this.beginRoundAnimation("round_text/round_1.png");
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

    player.reset();
    for(var i in this.remotePlayers) {
      this.remotePlayers[i].reset();
    }

    this.deadGroup = [];
    this.lastFrameTime;
    this.tearDownMap();
    this.initializeMap();
    this.bombs.destroy(true);
    this.destroyItems();
    this.bombs = new Phaser.Group(game);
    game.world.setChildIndex(this.bombs, 2);

    this.gameFrozen = false;
    socket.emit("ready for round");
  },

  destroyItems: function() {
    for(var itemKey in this.items) {
      this.items[itemKey].destroy();
    }

    this.items = {};
  },

  onNewRound: function(data) {
    this.createDimGraphic();
    var datAnimationDoe = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
    this.gameFrozen = true;


    var roundImage;
    if(data.completedRoundNumber < 2) {
      roundImage = "round_text/round_" + (data.completedRoundNumber + 1) + ".png";
    } else if (data.completedRoundNumber == 2) {
      roundImage = "round_text/final_round.png";
    } else {
      roundImage = "round_text/tiebreaker.png";
    }

    datAnimationDoe.beginAnimation(this.beginRoundAnimation.bind(this, roundImage, this.restartGame.bind(this)));
  },

  onEndGame: function(data) {
    // TODO: Tear down the state.
    this.createDimGraphic();
    this.gameFrozen = true;
    var animation = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
    animation.beginAnimation(function() {
      game.state.start("GameOver", true, false, data.gameWinnerColor, false);
    });
  },

  onNoOpponentsLeft: function(data) {
    game.state.start("GameOver", true, false, null, true);
  },

  beginRoundAnimation: function(image, callback) {
    var beginRoundText = game.add.image(-600, game.camera.height / 2, TEXTURES, image);
    beginRoundText.anchor.setTo(.5, .5);

    var tween = game.add.tween(beginRoundText);
    tween.to({x: game.camera.width / 2}, 300).to({x: 1000}, 300, Phaser.Easing.Default, false, 800).onComplete.add(function() {
      this.dimGraphic.destroy();
      beginRoundText.destroy();
      this.gameFrozen = false;

      if(callback) {
        callback();
      }
    }, this);

    tween.start();
  },

  update: function() {
    if(player != null && player.alive == true) {
      if(this.gameFrozen) {
        player.freeze();
      } else {
        player.handleInput();
        for(var itemKey in this.items) {
          var item = this.items[itemKey];
          game.physics.arcade.overlap(player, item, function(p, i) {
            socket.emit("powerup overlap", {x: item.x, y: item.y});
          });
        }
      }
    }

    this.stopAnimationForMotionlessPlayers();
    this.storePreviousPositions();

    for(var id in this.remotePlayers) {
      this.remotePlayers[id].interpolate(this.lastFrameTime);
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
    for(var id in this.remotePlayers) {
      remotePlayer = this.remotePlayers[id];
      remotePlayer.previousPosition = {x: remotePlayer.position.x, y: remotePlayer.position.y};
    }
  },

  stopAnimationForMotionlessPlayers: function() {
    for(var id in this.remotePlayers) {
      remotePlayer = this.remotePlayers[id];
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
        this.remotePlayers[data.id] = new RemotePlayer(data.x, data.y, data.id, data.color);
      }
    }
  },

  tearDownMap: function() {
      this.map.destroy();
      this.groundLayer.destroy();
      this.blockLayer.destroy();
  },

  initializeMap: function() {
    // This call to add.tilemap doesn't actually add anything to the game, it just creates a tilemap.
    this.map = game.add.tilemap(this.tilemapName);
    var mapInfo = MapInfo[this.tilemapName];

    this.map.addTilesetImage(mapInfo.tilesetName, mapInfo.tilesetImage, 40, 40);

    this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex(mapInfo.groundLayer), game.width, game.height);
    game.world.addAt(this.groundLayer, 0);
    this.groundLayer.resizeWorld();

    this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex(mapInfo.blockLayer), game.width, game.height);
    game.world.addAt(this.blockLayer, 1);
    this.blockLayer.resizeWorld(); // Set the world size to match the size of this layer.

    this.map.setCollision(mapInfo.collisionTiles, true, mapInfo.blockLayer);

    // Send map data to server so it can do collisions.
    // TODO: do not allow the game to start until this operation is complete.
    var blockLayerData = game.cache.getTilemapData(this.tilemapName).data.layers[1];

    socket.emit("register map", {tiles: blockLayerData.data, height: blockLayerData.height, width: blockLayerData.width, destructibleTileId: mapInfo.destructibleTileId});
  },

  onMovePlayer: function(data) {
    if(player && data.id == player.id || this.gameFrozen) {
      return;
    }

    var movingPlayer = this.remotePlayers[data.id];

    if(movingPlayer.targetPosition) {
      movingPlayer.animations.play(data.f);
      movingPlayer.lastMoveTime = game.time.now;

      if(data.x == movingPlayer.targetPosition.x && data.y == movingPlayer.targetPosition.y) {
        return;
      }

      movingPlayer.position.x = movingPlayer.targetPosition.x;
      movingPlayer.position.y = movingPlayer.targetPosition.y;

      movingPlayer.distanceToCover = {x: data.x - movingPlayer.targetPosition.x, y: data.y - movingPlayer.targetPosition.y};
      movingPlayer.distanceCovered = {x: 0, y:0};
    }

    movingPlayer.targetPosition = {x: data.x, y: data.y};
  },

  onRemovePlayer: function(data) {
    var playerToRemove = this.remotePlayers[data.id];

    if(playerToRemove.alive) {
      playerToRemove.destroy();
    }

    delete this.remotePlayers[data.id];
    delete this.players[data.id];
  },

  onKillPlayer: function(data) {
    if(data.id == player.id) {
      console.log("You've been killed.");

      player.kill();
    } else {
      var playerToRemove = this.remotePlayers[data.id];

      playerToRemove.kill();
    }
  },

  onPlaceBomb: function(data) {
   this.bombs.add(new Bomb(data.x, data.y, data.id));
  },

  onDetonate: function(data) {
    Bomb.renderExplosion(data.explosions);

    //remove bomb from group. bombs is a Phaser.Group to make collisions easier.
    level.bombs.forEach(function(bomb) {
      if(bomb && bomb.id == data.id) {
        bomb.remove();
      }
    }, level);

    data.destroyedTiles.forEach(function(destroyedTile) {
      this.map.removeTile(destroyedTile.col, destroyedTile.row, 1);
      if(destroyedTile.itemId) {
        this.generateItemEntity(destroyedTile.itemId, destroyedTile.row, destroyedTile.col);
      }
    }, this);
  },

  onPowerupAcquired: function(data) {
    this.items[data.powerupId].destroy();
    delete this.items[data.powerupId];

    if(data.acquiringPlayerId === player.id) {
      AudioPlayer.playPowerupSound();
      PowerupNotificationPlayer.showPowerupNotification(data.powerupType, player.x, player.y);
      if(data.powerupType == PowerupIDs.SPEED) {
        player.applySpeedPowerup();
      }
    }
  },

  generateItemEntity: function(itemId, row, col) {
     var imageKey = PowerupImageKeys[itemId];
     var item = new Phaser.Sprite(game, col * TILE_SIZE, row * TILE_SIZE, TEXTURES, imageKey);
     game.physics.enable(item, Phaser.Physics.ARCADE);
     this.items[row + "." + col] = item;

     game.world.addAt(item, 2);
  }
};
