// Dependencies
var util = require('util');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io').listen(server);

// Game objects
var Player = require('./entities/player');
var Bomb = require('./entities/bomb');

// Game Variables
var socket;
var game;
var players = {};
var bombs = {};

var TILE_SIZE = 40;

var spawnLocations = {
	1: [{x: 2, y: 5}, {x: 13, y: 1}, {x: 2, y: 1}, {x: 12, y: 6}]
};

var updateInterval = 100; // Broadcast updates every 100 ms.

app.use(express.static('client'));
server.listen(process.env.PORT || 8000);

init();

function init() {
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

		client.on("register map", onRegisterMap);
	});
};

function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	spawnLocations[1].push(players[this.id].spawnPoint);
	delete players[this.id];

	this.broadcast.emit("remove player", {id: this.id});
};

function onRegisterMap(map) {
	util.log(map);
};

function onNewPlayer(data) {
	// TODO: handle case where you're out of spawn points.
	var spawnPoint = spawnLocations[1].shift();

	// Create new player
	var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, 'down', this.id);
	newPlayer.spawnPoint = spawnPoint;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", newPlayer);

	this.emit("assign id", {x: newPlayer.x, y: newPlayer.y, id: this.id});

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
		socket.sockets.emit("detonate", {id: bombId, strength: playerId.bombStrength});
	}, 3000);

	this.broadcast.emit("place bomb", {x: data.x, y: data.y, id: data.id});
};

function broadcastingLoop() {
	for(var i in players) {
		var player = players[i];
		socket.sockets.emit("move player", {id: player.id, x: player.x, y: player.y, facing: player.facing, timestamp: (+new Date())});
	}
};