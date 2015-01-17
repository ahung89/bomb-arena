// Dependencies
var util = require('util');
var io = require('socket.io');
var Player = require('./Player');

// Game Variables
var socket;
var game;
var players = [];

init();

function init() {
	socket = io.listen(8120);

	// Begin listening for events.
	setEventHandlers();

	// Start game
	startGame();
};

function setEventHandlers () {
	socket.sockets.on("connection", function(client) {
		util.log("New player has connected: " + client.id);

		client.on("new player", onNewPlayer);

		client.on("move player", onMovePlayer);

		client.on("disconnect", onClientDisconnect);
	});
};

function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	var playerToRemove = findPlayerById(this.id);

	players.splice(players.indexOf(playerToRemove), 1);

	this.broadcast.emit("remove player", {id: this.id});
};

function onNewPlayer(data) {
	// Create new player
	var newPlayer = new Player(data.x, data.y, data.facing, this.id);

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", newPlayer);

	// Notify existing players of the new player
	for(var i = 0; i < players.length; i++) {
		var existingPlayer = players[i];
		this.emit("new player", existingPlayer);
	}

	players.push(newPlayer);
};

function onMovePlayer(data) {
	util.log("moving player");

	var movingPlayer = findPlayerById(this.id);

	movingPlayer.x = data.x;
	movingPlayer.y = data.y;
	movingPlayer.facing = data.facing;

	this.broadcast.emit("move player", {id: this.id, x: data.x, y: data.y, d: data.facing});
};

function startGame() {

};

function findPlayerById(id) {
	for(var i = 0; i < players.length; i++) {
		if(players[i].id == id)
			return players[i];
	}

	return false;
};