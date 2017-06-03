var TextConfigurer = require('../util/text_configurer');

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

var minPlayerMessageOffsetX = 80;
var minPlayerMessageOffsetY = 400;

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

		var backdrop = game.add.image(xOffset, yOffset, TEXTURES, "lobby/backdrop.png");
		this.startGameButton = game.add.button(buttonXOffset, startGameButtonYOffset, TEXTURES, null, this,
			"lobby/buttons/start_game_button_03.png", "lobby/buttons/start_game_button_03.png");
		this.leaveGameButton = game.add.button(buttonXOffset, leaveButtonYOffset, TEXTURES, this.leaveGameAction, null, 
			"lobby/buttons/leave_game_button_02.png", "lobby/buttons/leave_game_button_01.png");

		this.leaveGameButton.setDownSound(buttonClickSound);
		
		this.characterSquares = this.drawCharacterSquares(4);
		this.characterImages = [];
		this.numPlayersInGame = 0;

		this.minPlayerMessage = game.add.text(minPlayerMessageOffsetX, minPlayerMessageOffsetY, "Cannot start game without\nat least 2 players.")
		TextConfigurer.configureText(this.minPlayerMessage, "red", 17);
		this.minPlayerMessage.visible = false;

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
			var frame = i < numOpenings ? "lobby/slots/character_square_01.png" : "lobby/slots/character_square_02.png";
			characterSquares[i] = game.add.sprite(xOffset, yOffset, TEXTURES, frame);
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
		this.numPlayersInGame = 0;

		for(var playerId in data.players) {
			var color = data.players[playerId].color;
			this.characterImages[playerId] = game.add.image(this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX, 
				this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY, TEXTURES, "lobby/bomberman_head/bomberman_head_" + color + ".png");
			this.numPlayersInGame++;
		}

		if(this.numPlayersInGame > 1) {
			this.activateStartGameButton();
		} else {
			this.minPlayerMessage.visible = true;
		}
	},

	playerJoined: function(data) {
		this.numPlayersInGame++;
		var index = this.numPlayersInGame - 1;

		this.characterImages[data.id] = game.add.image(this.characterSquares[index].position.x + characterOffsetX,
		 this.characterSquares[index].position.y + characterOffsetY, TEXTURES, "lobby/bomberman_head/bomberman_head_" +  data.color + ".png");

		// Activate start game button if this is the second player to join the game.
		if(this.numPlayersInGame == 2) {
			this.activateStartGameButton();
		}
	},

	activateStartGameButton: function() {
		this.minPlayerMessage.visible = false;
		this.startGameButton.setFrames("lobby/buttons/start_game_button_02.png", "lobby/buttons/start_game_button_01.png");
		this.startGameButton.onInputUp.removeAll();
		this.startGameButton.onInputUp.add(this.startGameAction, this);
		this.startGameButton.setDownSound(buttonClickSound);
	},

	deactivateStartGameButton: function() {
		this.minPlayerMessage.visible = true;
		this.startGameButton.setFrames("lobby/buttons/start_game_button_03.png", "lobby/buttons/start_game_button_03.png");
		this.startGameButton.onInputUp.removeAll();
		this.startGameButton.setDownSound(null);
	},

	playerLeft: function(data) {
		this.numPlayersInGame--;

		if(this.numPlayersInGame == 1) {
			this.deactivateStartGameButton();
		}

		for(var playerId in this.characterImages) {
			this.characterImages[playerId].destroy();
		}
		this.populateCharacterSquares(data);
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
		socket.removeAllListeners();
		game.state.start("Level", true, false, data.mapName, data.players, this.id);
	}
}