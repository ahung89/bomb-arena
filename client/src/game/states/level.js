var Player = require('../entities/Player');
var RemotePlayer = require('../entities/RemotePlayer');

var Level = function () {};

module.exports = Level;

Level.prototype = {

  create: function () {
  	socket = io("http://localhost:8120"); // By default, this connects to the local host.
    
    player = new Player(Math.round(Math.random() * game.camera.width), Math.round(Math.random() * game.camera.height));

    setEventHandlers();
  },

  update: function() {
  	player.handleInput();
  	this.stopAnimationForMotionlessPlayers();
  	this.storePreviousPositions();
  },

  storePreviousPositions: function() {
  	remotePlayers.forEach(function(remotePlayer) {
  		remotePlayer.previousPosition = {x: remotePlayer.position.x, y: remotePlayer.position.y};
  	});
  },

  stopAnimationForMotionlessPlayers: function() {
  	remotePlayers.forEach(function(remotePlayer) {
  		if(remotePlayer.previousPosition.x == remotePlayer.position.x && remotePlayer.previousPosition.y == remotePlayer.position.y) {
  			remotePlayer.animations.stop();
  		}
  	});
  }
};

  // TODO: Move this somewhere else.
function setEventHandlers() {
	socket.on("connect", onSocketConnected);
  	socket.on("disconnect", onSocketDisconnect);
  	socket.on("new player", onNewPlayer);
  	socket.on("move player", onMovePlayer);
  	socket.on("remove player", onRemovePlayer);
};

function onSocketConnected() {
	console.log("Connected to socket server.");

	socket.emit("new player", {x: player.position.x, y: player.position.y});
};

function onSocketDisconnect() {
	console.log("Disconnected from socket server.");

	this.broadcast.emit("remove player", {id: this.id});
};

function onNewPlayer(data) {
	remotePlayers.push(new RemotePlayer(data.x, data.y, data.id));
};

function onMovePlayer(data) {
	var movingPlayer = findRemotePlayerById(data.id);

	movingPlayer.position.x = data.x;
	movingPlayer.position.y = data.y;

	movingPlayer.animations.play(data.facing);
};

function onRemovePlayer(data) {
	var playerToRemove = findRemotePlayerById(data.id);

	playerToRemove.destroy();

	remotePlayers.splice(remotePlayers.indexOf(playerToRemove), 1);
};

function findRemotePlayerById(id) {
	for(var i = 0; i < remotePlayers.length; i++) {
		if(remotePlayers[i].id == id)
			return remotePlayers[i];
	}

	return false;
};