var PendingGame = function() {}

module.exports = PendingGame;

var xOffset = 40;
var yOffset = 50;

var buttonXOffset = 330;
var startGameButtonYOffset = 400;
var leaveButtonYOffset = 450;

var characterSquareStartingX = 330;
var characterSquareStartingY = 80;
var characterSquareXDistance = 105;
var characterSquareYDistance = 100;

var characterOffsetX = 4.5;
var characterOffsetY = 4.5;

var numCharacterSquares = 6;

var repeatingBombTilesprite;

PendingGame.prototype = {
	init: function(tilemapName, gameId, rbts) {
		this.tilemapName = tilemapName;
		this.gameId = gameId;
		repeatingBombTilesprite = rbts;
	},

	create: function() {
		socket.emit("enter pending game", {gameId: this.gameId});

		var backdrop = game.add.image(xOffset, yOffset, "pending_game_backdrop");
		this.startGameButton = game.add.button(buttonXOffset, startGameButtonYOffset, "start_game_button", this.startGameAction, this,
			1, 0);
		this.leaveGameButton = game.add.button(buttonXOffset, leaveButtonYOffset, "leave_game_button", this.leaveGameAction, null, 1, 0);
		this.characterSquares = this.drawCharacterSquares(4);
		this.characterImages = [];
		this.numPlayersInGame = 0;

		socket.on("show current players", this.populateCharacterSquares.bind(this));
		socket.on("player joined", this.playerJoined.bind(this));
		socket.on("player left", this.playerLeft.bind(this));
		socket.on("start game on client", this.startGame);
	},

	update: function() {
		repeatingBombTilesprite.tilePosition.x++;
		repeatingBombTilesprite.tilePosition.y--;
	},

	drawCharacterSquares: function(numOpenings) {
		var characterSquares = [];
		var yOffset = characterSquareStartingY;
		var xOffset = characterSquareStartingX;

		for(var i = 0; i < numCharacterSquares; i++) {
			var frame = i < numOpenings ? 0 : 1;
			characterSquares[i] = game.add.sprite(xOffset, yOffset, "character_square", frame);
			if(i % 2 == 0) {
				xOffset += characterSquareXDistance;
			} else {
				xOffset = characterSquareStartingX;
				yOffset += characterSquareYDistance;
			}
		}

		return characterSquares;
	},

	populateCharacterSquares: function(data) {
		this.numPlayersInGame = data.numPlayers;

		for(var i = 0; i < this.numPlayersInGame; i++) {
			this.characterImages[i] = game.add.image(this.characterSquares[i].position.x + characterOffsetX, this.characterSquares[i].position.y + characterOffsetY, "bomberman_head");
		}
	},

	playerJoined: function() {
		this.numPlayersInGame++;
		var index = this.numPlayersInGame - 1;

		this.characterImages[index] = game.add.image(this.characterSquares[index].position.x + characterOffsetX, this.characterSquares[index].position.y + characterOffsetY, "bomberman_head");
	},

	playerLeft: function() {
		this.numPlayersInGame--;
		var index = this.numPlayersInGame;
		this.characterImages[index].destroy();
	},

	// When the "start" button is clicked, send a message to the server to initialize the game.
	startGameAction: function() {
		socket.emit("start game on server");
	},

	leaveGameAction: function() {
		socket.emit("leave pending game");
		socket.removeAllListeners();
		game.state.start("Lobby", true, false, repeatingBombTilesprite);
	},

	startGame: function(data) {
		repeatingBombTilesprite.doNotDestroy = false;
		game.state.start("Level", true, false, data.mapName, data.players, this.id);
	}
}