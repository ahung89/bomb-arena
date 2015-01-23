// Dependencies
var util = require('util');
var io = require('socket.io');

// Game objects
var Player = require('./entities/player');
var Bomb = require('./entities/bomb');

// Game Variables
var socket;
var game;
var players = {};
var bombs = {};

var updateInterval = 200; // Broadcast updates every 100 ms.

init();

function init() {
	socket = io.listen(process.env.PORT || 8120);

	// Begin listening for events.
	setEventHandlers();

	// Start game loop
	setInterval(broadcastingLoop, updateInterval);
};

function setEventHandlers () {
	socket.sockets.on("connection", function(client) {
		util.log("New player has connected: " + client.id);

		client.on("new player", onNewPlayer);

		client.on("move player", onMovePlayer);

		client.on("disconnect", onClientDisconnect);

		client.on("place bomb", onPlaceBomb);
	});
};

function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	delete players[this.id];

	this.broadcast.emit("remove player", {id: this.id});
};

function onNewPlayer(data) {
	// Create new player
	var newPlayer = new Player(data.x, data.y, data.facing, this.id);

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", newPlayer);

	this.emit("assign id", {id: this.id});

	// Notify existing players of the new player
	for(var i in players) {
		this.emit("new player", players[i]);
	}

	players[this.id] = newPlayer;
	bombs[this.id] = {};
};

function onMovePlayer(data) {
	var movingPlayer = players[this.id];

	movingPlayer.x = data.x;
	movingPlayer.y = data.y;
	movingPlayer.facing = data.facing;

	// this.broadcast.emit("move player", {id: this.id, x: data.x, y: data.y, facing: data.facing, timestamp: (+new Date())});
};

function onPlaceBomb(data) {
	var bombId = data.id;
	var playerId = this.id;

	bombs[playerId][bombId]= new Bomb(data.x, data.y, bombId);

	setTimeout(function() {
		delete bombs[playerId][bombId];		
		util.log("deleting bomb " + bombId);
		socket.sockets.emit("detonate", {id: bombId});
	}, 3000);

	this.broadcast.emit("place bomb", {x: data.x, y: data.y, id: data.id});
};

function broadcastingLoop() {
	for(var i in players) {
		var player = players[i];
		socket.sockets.emit("move player", {id: player.id, x: player.x, y: player.y, facing: player.facing, timestamp: (+new Date())});
	}
};