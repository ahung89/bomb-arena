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
var Game = require('./entities/game');
var PendingGame = require('./entities/pending_game');

var games = {};

var numPlayers = 0;

// Game Variables
var lobbyId = -1;
var lobbySlots = [];
var numLobbySlots = 7;

var spawnLocations = {
	1: [{x: 2, y: 5}, {x: 13, y: 1}, {x: 2, y: 1}, {x: 12, y: 6}]
};

var updateInterval = 100; // Broadcast updates every 100 ms.

app.use(express.static('client'));
server.listen(process.env.PORT || 8000);

init();

function init() {
	initializeLobbySlots();

	//This is the first stage - eventually the games will be created via the lobby.
	var game = new Game();
	games[123] = game;

	var game2 = new Game();
	games[456] = game2;

	// Begin listening for events.
	setEventHandlers();

	// Start game loop
	setInterval(broadcastingLoop, updateInterval);
};

function initializeLobbySlots() {
	for(var i = 0; i < numLobbySlots; i++) {
		lobbySlots.push(new PendingGame());
	}
};

function setEventHandlers () {
	socket.sockets.on("connection", function(client) {
		util.log("New player has connected: " + client.id);

		client.on("new player", onNewPlayer);

		client.on("move player", onMovePlayer);

		client.on("disconnect", onClientDisconnect);

		client.on("place bomb", onPlaceBomb);

		client.on("register map", onRegisterMap);

		client.on("enter lobby", onEnterLobby);

		client.on("host game", onHostGame);

		client.on("select stage", onStageSelect);
	});
};

function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	var game = games[this.gameId];

	//TODO: remove this return statement
	return;

	if(this.id in game.players) {
		spawnLocations[1].push(game.players[this.id].spawnPoint);
		delete game.players[this.id];

		socket.sockets.emit("remove player", {id: this.id});	

		numPlayers--;
	}
};

function onRegisterMap(data) {
	games[this.gameId].map = new Map(data, TILE_SIZE);
};

function onNewPlayer(data) {
	if(spawnLocations[1].length == 0) {
		return;
	}

	numPlayers++;

	var spawnPoint = spawnLocations[1].shift();

	// This is temporary.
	this.gameId = numPlayers <= 2 ? 123 : 456;
	this.join(this.gameId);
	var game = games[this.gameId];

	// Create new player
	var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, 'down', this.id);
	newPlayer.spawnPoint = spawnPoint;

	// Broadcast new player to connected socket clients
	this.broadcast.to(this.gameId).emit("new player", newPlayer);

	this.emit("assign id", {x: newPlayer.x, y: newPlayer.y, id: this.id});

	// Notify the new player of the existing players.
	for(var i in game.players) {
		this.emit("new player", game.players[i]);
	}
	
	game.players[this.id] = newPlayer;
	game.bombs[this.id] = {};
};

function onMovePlayer(data) {
	var game = games[this.gameId];

	var movingPlayer = game.players[this.id];

	// Moving player can be null if a player is killed and leftover movement signals come through.
	if(!movingPlayer) {
		return;
	}

	movingPlayer.x = data.x;
	movingPlayer.y = data.y;
	movingPlayer.facing = data.facing;
};

function onPlaceBomb(data) {
	var game = games[this.gameId];
	var gameId = this.gameId;

	var bombId = data.id;
	var playerId = this.id;

	var normalizedBombLocation = game.map.findNearestTileCenter(data.x, data.y);
	game.bombs[playerId][bombId]= new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombId);

	setTimeout(function() {
		var explosionData = game.bombs[playerId][bombId].detonate(game.map, 2, game.players);

		delete game.bombs[playerId][bombId];

		socket.sockets.in(gameId).emit("detonate", {explosions: explosionData.explosions, id: bombId});

		explosionData.killedPlayers.forEach(function(killedPlayerId) {
			signalPlayerDeath(killedPlayerId, game, gameId);
		});
	}, 2000);

	socket.sockets.to(this.gameId).emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
};

function signalPlayerDeath(id, game, gameId) {
	util.log("Player has been killed: " + id);

	spawnLocations[1].push(game.players[id].spawnPoint);
	delete game.players[id];
	
	socket.sockets.in(gameId).emit("kill player", {id: id});
}

function broadcastingLoop() {
	for(var g in games) {
		var game = games[g];
		for(var i in game.players) {
			var player = game.players[i];
			socket.sockets.in(g).emit("move player", {id: player.id, x: player.x, y: player.y, facing: player.facing, timestamp: (+new Date())});
		}
	}
};

function onEnterLobby(data) {
	util.log("player has joined lobby");
	this.join(lobbyId);
	socket.sockets.in(lobbyId).emit("add slots", lobbySlots);
};

// LOBBY CODE - Will refactor into other class once it's working.
function onHostGame(data) {
	lobbySlots[data.gameId].state = "insession";
	lobbySlots[data.gameId].playerIds.push(this.id);
	socket.sockets.in(lobbyId).emit("update slot", {gameId: data.gameId, newState: "insession"});
};

function onStageSelect(data) {
	lobbySlots[data.gameId].state = "joinable";
	socket.sockets.in(lobbyId).emit("update slot", {gameId: data.gameId, newState: "joinable"});
};