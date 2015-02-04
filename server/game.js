TILE_SIZE = 40;

// Dependencies
var util = require('util');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io').listen(server);

// Game objects
var Player = require('./entities/player');
var Bomb = require('./entities/bomb');
var Map = require('./entities/map');

// Game Variables
var socket;
var game;
var map;
var players = {};
var bombs = {};

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

	socket.sockets.emit("remove player", {id: this.id});	
};

function onRegisterMap(data) {
	map = new Map(data, TILE_SIZE);
};

function onNewPlayer(data) {
	if(spawnLocations[1].length == 0) {
		return;
	}

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
};

function onPlaceBomb(data) {
	var bombId = data.id;
	var playerId = this.id;

	var normalizedBombLocation = map.findNearestTileCenter(data.x, data.y);
	bombs[playerId][bombId]= new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombId);

	setTimeout(function() {
		var explosionData = bombs[playerId][bombId].detonate(map, 2, players);

		delete bombs[playerId][bombId];

		socket.sockets.emit("detonate", {explosions: explosionData.explosions, id: bombId});

		explosionData.killedPlayers.forEach(function(killedPlayer) {
			signalPlayerDeath(killedPlayer);
		});
	}, 2000);

	socket.sockets.emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
};

function signalPlayerDeath(id) {
	util.log("Player has been killed: " + id);
	
	socket.sockets.emit("kill player", {id: id});
}

function broadcastingLoop() {
	for(var i in players) {
		var player = players[i];
		socket.sockets.emit("move player", {id: player.id, x: player.x, y: player.y, facing: player.facing, timestamp: (+new Date())});
	}
};