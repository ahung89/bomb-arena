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

PendingGame.prototype = {
	init: function(tilemapName, gameId) {
		this.tilemapName = tilemapName;
		this.gameId = gameId;
	},

	create: function() {
		console.log("startin dat state, sendin da ID " + this.gameId);
		socket.emit("enter pending game", {gameId: this.gameId});

		this.repeatingBombTilesprite = game.add.tileSprite(0, 0, 608, 608, "repeating_bombs");
		var backdrop = game.add.image(xOffset, yOffset, "pending_game_backdrop");
		this.startGameButton = game.add.button(buttonXOffset, startGameButtonYOffset, "start_game_button", this.startGame, this,
			1, 0);
		this.leaveGameButton = game.add.button(buttonXOffset, leaveButtonYOffset, "leave_game_button", null, null, 1, 0);
		this.characterSquares = this.drawCharacterSquares(4);
		this.characterImages = [];
		this.numPlayersInGame = 0;

		socket.on("show current players", this.populateCharacterSquares.bind(this));
		socket.on("player joined", this.playerJoined.bind(this));
	},

	update: function() {
		this.repeatingBombTilesprite.tilePosition.x++;
		this.repeatingBombTilesprite.tilePosition.y--;
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

	startGame: function() {
		// TODO: send signal to server so that the game starts for all players in the game.
		game.state.start("Level", true, false, this.tilemapName);
	}
}