// Dependencies
var util = require('util');
var io = require('socket.io');
var Player = require('./Player');

// Game Variables
var socket;
var game;

init();

function init() {
	socket = io.listen(8120);

	// Begin listening for events.
	setEventHandlers();

	// Start game
	startGame();
};

function setEventHandlers () {
	socket.sockets.on('connection', function(client) {
		util.log("New player has connected: " + client.id);

		client.on('new player', onNewPlayer);

		client.on('move player', onMovePlayer);

		client.on('disconnect', onClientDisconnect);
	});
};

function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	this.broadcast.emit('remove player', {id: this.id});
};

function onNewPlayer(data) {
	// Create new player
	var newPlayer = new Player(data.x, data.y, this.id);

	// Broadcast new player to connected socket clients
	this.broadcast.emit('new player', newPlayer);

	// Notify existing players of the new player
	for(var i = 0; i < players.length; i++) {
		var existingPlayer = players[i];
		this.emit('new player', newPlayer);
	}
};

function onMovePlayer(data) {
	this.broadcast.emit('move player', {id: this.id, x: data.x, y: data.y, d: data.direction});
};

function startGame() {

};
