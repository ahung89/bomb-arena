var Lobby = function() {};

var initialSlotYOffset = 130;
var slotXOffset = 40;
var lobbySlotDistance = 60;

var textXOffset = 260;
var textYOffset = 25;

module.exports = Lobby;

Lobby.prototype = {
	create: function() {
		this.repeatingBombTilesprite = game.add.tileSprite(0, 0, 608, 608, "repeating_bombs");
		this.backdrop = game.add.image(12.5, 12.5, "lobby_backdrop");

		this.slots = [];
		this.labels = [];

		var gameData = [{state: "empty"}, {state: "empty"}, {state: "joinable"}, {state: "insession"}];

		socket.emit("enter lobby");
		socket.on("add slots", this.addSlots.bind(this));
	},

	update: function() {
		this.repeatingBombTilesprite.tilePosition.x++;
		this.repeatingBombTilesprite.tilePosition.y--;
	},

	addSlots: function(gameData) {
		console.log(gameData.length);
		for(var i = 0; i < gameData.length; i++) {
			var outFrame, overFrame, text, callback;

			(function(n, hostGameFunction) {
				switch(gameData[n].state) {
				case "empty":
					outFrame = 0;
					overFrame = 1;
					text = "Host Game";
					callback = function() {
						hostGameFunction(n);
					}
					break;
				case "joinable":
					outFrame = 2;
					overFrame = 3;
					text = "Join Game";
					callback = null;
					break;
				case "insession":
					outFrame = 4;
					overFrame = 4;
					text = "Game In Session"
					callback = null;

			}
			})(i, this.hostGameAction);
			
			var slotYOffset = initialSlotYOffset + i * lobbySlotDistance;
			this.slots[i] = game.add.button(slotXOffset, slotYOffset, "game_slot", callback, null, overFrame, outFrame);
			
			var text = game.add.text(slotXOffset + textXOffset, slotYOffset + textYOffset, text);
			this.configureText(text, "white", 18);
			text.anchor.setTo(.5, .5);

			this.labels[i] = text;
		}
	},

	configureText: function(text, color, size) {
		text.font = "Carter One";
		text.fill = color;
		text.fontSize = size;
	},

	hostGameAction: function(gameId) {
		game.state.start("StageSelect", true, false, gameId);
	}
};