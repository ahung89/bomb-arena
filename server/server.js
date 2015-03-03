TILE_SIZE = 40;

// Dependencies
var util = require("util");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var socket = require("socket.io").listen(server);

// Game objects
var Player = require("./entities/player");
var Bomb = require("./entities/bomb");
var Map = require("./entities/map");
var Game = require("./entities/game");
var PendingGame = require("./entities/pending_game");
var MapInfo = require("./metadata/map_info");

var games = {};

// Game Variables
var lobbyId = -1;
var lobbySlots = [];
var numLobbySlots = 7;

var updateInterval = 100; // Broadcast updates every 100 ms.

app.use(express.static("client"));
server.listen(process.env.PORT || 8000);

init();

function init() {
	initializeLobbySlots();

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

		client.on("move player", onMovePlayer);
		client.on("disconnect", onClientDisconnect);
		client.on("place bomb", onPlaceBomb);
		client.on("register map", onRegisterMap);
		client.on("enter lobby", onEnterLobby);
		client.on("host game", onHostGame);
		client.on("select stage", onStageSelect);
		client.on("enter pending game", onEnterPendingGame);
		client.on("leave pending game", onLeavePendingGame);
		client.on("start game on server", onStartGame);
	});
};

function onClientDisconnect() {
	if (this.gameId == null) {
		return;
	}

	if (lobbySlots[this.gameId].state == "joinable" || lobbySlots[this.gameId].state == "full") {
		leavePendingGame.call(this);
	} else if (lobbySlots[this.gameId].state == "settingup") {
		lobbySlots[this.gameId].state = "empty";

		// TODO: Move this out.
		socket.sockets.in(lobbyId).emit("update slot", {gameId: this.gameId, newState: "empty"});
	} else if(lobbySlots[this.gameId].state == "inprogress") {
		var game = games[this.gameId];
	
		if(this.id in game.players) {
			delete game.players[this.id];
	
			socket.sockets.emit("remove player", {id: this.id});	
		}

		if(Object.keys(game.players).length == 0) {
			delete games[this.gameId];

			lobbySlots[this.gameId] = new PendingGame();

			// TODO: Move this out. Like, seriously.
			socket.sockets.in(lobbyId).emit("update slot", {gameId: this.gameId, newState: "empty"});
		}
	}
};

function onLeavePendingGame() {
	leavePendingGame.call(this);
};

function leavePendingGame() {
	var lobbySlot = lobbySlots[this.gameId];

	this.leave(this.gameId);
	socket.sockets.in(this.gameId).emit("player left");
	lobbySlot.playerIds.splice(lobbySlot.playerIds.indexOf(this.id), 1);

	if(lobbySlot.playerIds.length == 0) {
		lobbySlot.state = "empty";
		socket.sockets.in(lobbyId).emit("update slot", {gameId: this.gameId, newState: "empty"});
	}

	if(lobbySlot.state == "full") {
		lobbySlot.state = "joinable";
		socket.sockets.in(lobbyId).emit("update slot", {gameId: this.gameId, newState: "joinable"});
	}
};

function onRegisterMap(data) {
	games[this.gameId].map = new Map(data, TILE_SIZE);
};

// Create new game, set up players, assign spawn points, broadcast info to all players.
function onStartGame() {
	var game = new Game();
	games[this.gameId] = game;
	var pendingGame = lobbySlots[this.gameId];
	lobbySlots[this.gameId].state = "inprogress";

	// Refactor this call out, since it's being used several times.
	socket.sockets.in(lobbyId).emit("update slot", {gameId: this.gameId, newState: "inprogress"});

	for(var i = 0; i < pendingGame.playerIds.length; i++) {
		var playerId = pendingGame.playerIds[i];
		var spawnPoint = MapInfo[pendingGame.mapName].spawnLocations[i];
		var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, "down", playerId);
		newPlayer.spawnPoint = spawnPoint;

		game.players[playerId] = newPlayer;
		game.bombs[playerId] = {};
	}

	socket.sockets.in(this.gameId).emit("start game on client", {mapName: pendingGame.mapName, players: game.players});
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

	delete game.players[id];
	
	socket.sockets.in(gameId).emit("kill player", {id: id});
};

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
	lobbySlots[data.gameId].state = "settingup";
	this.gameId = data.gameId;
	socket.sockets.in(lobbyId).emit("update slot", {gameId: data.gameId, newState: "settingup"});
};

function onStageSelect(data) {
	lobbySlots[data.gameId].state = "joinable";
	lobbySlots[data.gameId].mapName = data.mapName;
	socket.sockets.in(lobbyId).emit("update slot", {gameId: data.gameId, newState: "joinable"});
};

function onEnterPendingGame(data) {
	var pendingGame = lobbySlots[data.gameId];

	this.leave(lobbyId); // no-op if the player already has left lobby? make a separate leave lobby listener?
	this.join(data.gameId);

	pendingGame.playerIds.push(this.id);
	this.gameId = data.gameId;

	this.emit("show current players", {numPlayers: pendingGame.playerIds.length});
	this.broadcast.to(data.gameId).emit("player joined");

	if(pendingGame.playerIds.length >= MapInfo[pendingGame.mapName].spawnLocations.length) {
		pendingGame.state = "full";
		socket.sockets.in(lobbyId).emit("update slot", {gameId: data.gameId, newState: "full"});
	}
};