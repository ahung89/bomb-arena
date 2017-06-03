var express = require("express");
var app = express();
var server = require("http").Server(app);

io = require("socket.io").listen(server);
TILE_SIZE = 40;

// Game objects
var Player = require("./entities/player");
var Bomb = require("./entities/bomb");
var Map = require("./entities/map");
var MapInfo = require("../common/map_info");
var Game = require("./entities/game");
var Lobby = require("./lobby");
var PendingGame = require("./entities/pending_game");
var PowerupIDs = require("../common/powerup_ids");

var games = {};

// Broadcasting loop works better than sending an update every time a player moves because waiting for player movement messages adds
// another source of jitter.
var updateInterval = 100; // Broadcast updates every 100 ms.

// Serve up index.html.
app.use(express.static("client"));
server.listen(process.env.PORT || 8000);

init();

function init() {
	Lobby.initialize();

	// Begin listening for events.
	setEventHandlers();

	// Start game loop
	setInterval(broadcastingLoop, updateInterval);
};

function setEventHandlers () {
	io.on("connection", function(client) {
		console.log("New player has connected: " + client.id);

		client.on("move player", onMovePlayer);
		client.on("disconnect", onClientDisconnect);
		client.on("place bomb", onPlaceBomb);
		client.on("register map", onRegisterMap);
		client.on("start game on server", onStartGame);
		client.on("ready for round", onReadyForRound);
		client.on("powerup overlap", onPowerupOverlap);

		client.on("enter lobby", Lobby.onEnterLobby);
		client.on("host game", Lobby.onHostGame);
		client.on("select stage", Lobby.onStageSelect);
		client.on("enter pending game", Lobby.onEnterPendingGame);
		client.on("leave pending game", Lobby.onLeavePendingGame);
	});
};

function onClientDisconnect() {
	if (this.gameId == null) {
		return;
	}

	var lobbySlots = Lobby.getLobbySlots();

	if (lobbySlots[this.gameId].state == "joinable" || lobbySlots[this.gameId].state == "full") {
		Lobby.onLeavePendingGame.call(this);
	} else if (lobbySlots[this.gameId].state == "settingup") {
		lobbySlots[this.gameId].state = "empty";

		Lobby.broadcastSlotStateUpdate(this.gameId, "empty");
	} else if(lobbySlots[this.gameId].state == "inprogress") {
		var game = games[this.gameId];
	
		if(this.id in game.players) {
			console.log("deleting " + this.id);
			delete game.players[this.id];
	
			io.in(this.gameId).emit("remove player", {id: this.id});	
		}

		if(game.numPlayers < 2) {
			if(game.numPlayers == 1) {
				io.in(this.gameId).emit("no opponents left");
			}
			terminateExistingGame(this.gameId);
		}

		if(game.awaitingAcknowledgements && game.numEndOfRoundAcknowledgements >= game.numPlayers) {
			game.awaitingAcknowledgements = false;
		}
	}
};

// Deletes the game object and frees up the slot.
function terminateExistingGame(gameId) {
	games[gameId].clearBombs();

	delete games[gameId];

	Lobby.getLobbySlots()[gameId] = new PendingGame();

	Lobby.broadcastSlotStateUpdate(gameId, "empty");
};

function onStartGame() {
	var lobbySlots = Lobby.getLobbySlots();

	var game = new Game();
	games[this.gameId] = game;
	var pendingGame = lobbySlots[this.gameId];
	lobbySlots[this.gameId].state = "inprogress";

	Lobby.broadcastSlotStateUpdate(this.gameId, "inprogress");

	var ids = pendingGame.getPlayerIds();
	
	for(var i = 0; i < ids.length; i++) {
		var playerId = ids[i];
		var spawnPoint = MapInfo[pendingGame.mapName].spawnLocations[i];
		var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, "down", playerId, pendingGame.players[playerId].color);
		newPlayer.spawnPoint = spawnPoint;

		game.players[playerId] = newPlayer;
	}

	game.numPlayersAlive = ids.length;

	io.in(this.gameId).emit("start game on client", {mapName: pendingGame.mapName, players: game.players});
};

function onRegisterMap(data) {
	games[this.gameId].map = new Map(data, TILE_SIZE);
};

function onMovePlayer(data) {
	var game = games[this.gameId];

	if(game === undefined || game.awaitingAcknowledgements) {
		return;
	}

	var movingPlayer = game.players[this.id];

	// Moving player can be null if a player is killed and leftover movement signals come through.
	if(!movingPlayer) {
		return;
	}

	movingPlayer.x = data.x;
	movingPlayer.y = data.y;
	movingPlayer.facing = data.facing;
	movingPlayer.hasMoved = true;
};

function onPlaceBomb(data) {
	var game = games[this.gameId];
	var player = game.players[this.id];

	if(game === undefined || game.awaitingAcknowledgements || player.numBombsAlive >= player.bombCapacity) {
		return;
	}

	var gameId = this.gameId;
	var bombId = data.id;
	var normalizedBombLocation = game.map.placeBombOnGrid(data.x, data.y);

	if(normalizedBombLocation == -1) {
		return;
	}

	player.numBombsAlive++;

	var bombTimeoutId = setTimeout(function() {
		console.log("detonatin with ", game.players);
		var explosionData = bomb.detonate(game.map, player.bombStrength, game.players);
		player.numBombsAlive--;

		io.in(gameId).emit("detonate", {explosions: explosionData.explosions, id: bombId, 
			destroyedTiles: explosionData.destroyedBlocks});
		delete game.bombs[bombId];
		game.map.removeBombFromGrid(data.x, data.y);

		handlePlayerDeath(explosionData.killedPlayers, gameId);
	}, 2000);

	var bomb = new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombTimeoutId);
	game.bombs[bombId] = bomb;

	io.to(this.gameId).emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
};

function onPowerupOverlap(data) {
	var powerup = games[this.gameId].map.claimPowerup(data.x, data.y);

	if(!powerup) {
		return;
	}

	var player = games[this.gameId].players[this.id];

	if(powerup.powerupType === PowerupIDs.BOMB_STRENGTH) {
		player.bombStrength++;
	} else if(powerup.powerupType === PowerupIDs.BOMB_CAPACITY) {
		player.bombCapacity++;
	}

	io.in(this.gameId).emit("powerup acquired", {acquiringPlayerId: this.id, powerupId: powerup.id, powerupType: powerup.powerupType});
};

function handlePlayerDeath(deadPlayerIds, gameId) {
	var tiedWinnerIds;

	if(deadPlayerIds.length > 1 && games[gameId].numPlayersAlive - deadPlayerIds.length == 0) {
		tiedWinnerIds = deadPlayerIds;
	}

	deadPlayerIds.forEach(function(deadPlayerId) {
		games[gameId].players[deadPlayerId].alive = false;
		io.in(gameId).emit("kill player", {id: deadPlayerId});
		games[gameId].numPlayersAlive--;
	}, this);

	if(games[gameId].numPlayersAlive <= 1) {
		endRound(gameId, tiedWinnerIds);
	}
};

function endRound(gameId, tiedWinnerIds) {
	var roundWinnerColors = [];

	var game = games[gameId];

	if(tiedWinnerIds) {
		tiedWinnerIds.forEach(function(tiedWinnerId) {
			roundWinnerColors.push(game.players[tiedWinnerId].color);
		});
	} else {
		var winner = game.calculateRoundWinner();
		winner.wins++;
		roundWinnerColors.push(winner.color);
	}

	game.currentRound++;

	if(game.currentRound > 2) {
		var gameWinners = game.calculateGameWinners();

		if(gameWinners.length == 1 && (game.currentRound > 3 || gameWinners[0].wins == 2)) {
			io.in(gameId).emit("end game", {completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors, 
				gameWinnerColor: gameWinners[0].color});
			terminateExistingGame(gameId);
			return;
		}
	}

	game.awaitingAcknowledgements = true;
	game.resetForNewRound();


	io.in(gameId).emit("new round", {completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors});
};

function onReadyForRound() {
	var game = games[this.gameId];

	if(!game.awaitingAcknowledgements) {
		return;
	}

	game.acknowledgeRoundReadinessForPlayer(this.id);

	if(game.numRoundReadinessAcknowledgements >= game.numPlayers) {
		game.awaitingAcknowledgements = false;
	}
};

function broadcastingLoop() {
	for(var g in games) {
		var game = games[g];
		for(var i in game.players) {
			var player = game.players[i];
			if(player.alive && player.hasMoved) {
				io.to(g).emit("m", {id: player.id, x: player.x, y: player.y, f: player.facing});
				player.hasMoved = false;
			}
		}
	}
};