var Player = require('../entities/Player');
var RemotePlayer = require('../entities/RemotePlayer');
var Bomb = require('../entities/Bomb');

var Level = function () {};

module.exports = Level;

Level.prototype = {

  create: function () {
    level = this;
    this.lastFrameTime;

  	socket = io("https://limitless-brook-9339.herokuapp.com:443");
    // socket = io("http://localhost:8000");

    this.map = game.add.tilemap("levelOne");
    this.map.addTilesetImage("tilez", "tiles", 40, 40);
    this.layer = this.map.createLayer('World');
    this.layer.resizeWorld();

    player = new Player(Math.round(Math.random() * game.camera.width), Math.round(Math.random() * game.camera.height));


    this.bombs = game.add.group();
    game.physics.enable(this.bombs, Phaser.Physics.ARCADE);



    setEventHandlers();
  },

  update: function() {
  	player.handleInput();
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
  }
};

  // TODO: Move this somewhere else.
function setEventHandlers() {
	socket.on("connect", onSocketConnected);
  socket.on("assign id", onAssignId);
  socket.on("disconnect", onSocketDisconnect);
  socket.on("new player", onNewPlayer);
  socket.on("move player", onMovePlayer);
  socket.on("remove player", onRemovePlayer);
  socket.on("place bomb", onPlaceBomb);
  socket.on("detonate", onDetonate);
};

function onSocketConnected() {
	console.log("Connected to socket server.");

	socket.emit("new player", {x: player.position.x, y: player.position.y});
};

function onAssignId(data) {
  player.id = data.id;
}

function onSocketDisconnect() {
	console.log("Disconnected from socket server.");

	this.broadcast.emit("remove player", {id: this.id});
};

function onNewPlayer(data) {
	remotePlayers[data.id] = new RemotePlayer(data.x, data.y, data.id);
};

function onMovePlayer(data) {
  if(!player.id || data.id == player.id) {
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
};

function onRemovePlayer(data) {
	var playerToRemove = remotePlayers[data.id];

	playerToRemove.destroy();

  delete remotePlayers[data.id];
};

function onPlaceBomb(data) {
  level.bombs.add(new Bomb(data.x, data.y, data.id));
};

function onDetonate(data) {
  level.bombs.forEach(function(bomb) {
    if(bomb && bomb.id == data.id) {
      bomb.destroy();
    }
  });
};