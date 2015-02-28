var Lobby = function() {};

var initialSlotYOffset = 130;
var slotXOffset = 40;
var lobbySlotDistance = 60;

var textXOffset = 260;
var textYOffset = 25;

module.exports = Lobby;

Lobby.prototype = {
	create: function() {
		this.stateSettings = {
			empty: {
				outFrame: 0,
				overFrame: 1,
				text: "Host Game",
				callback: this.hostGameAction
			},
			joinable: {
				outFrame: 2,
				overFrame: 3,
				text: "Join Game",
				callback: null
			},
			insession: {
				outFrame: 4,
				overFrame: 5,
				text: "Game in Session",
				callback: null
			}
		};

		this.repeatingBombTilesprite = game.add.tileSprite(0, 0, 608, 608, "repeating_bombs");
		this.backdrop = game.add.image(12.5, 12.5, "lobby_backdrop");

		this.slots = [];
		this.labels = [];

		var gameData = [{state: "empty"}, {state: "empty"}, {state: "joinable"}, {state: "insession"}];

		socket.emit("enter lobby");
		socket.on("add slots", this.addSlots.bind(this));
		socket.on("update slot", this.updateSlot.bind(this));
	},

	update: function() {
		this.repeatingBombTilesprite.tilePosition.x++;
		this.repeatingBombTilesprite.tilePosition.y--;
	},

	addSlots: function(gameData) {
		if(this.slots.length > 0)  // TODO: get rid of this
			return;

		console.log(gameData.length);
		for(var i = 0; i < gameData.length; i++) {
			var callback = null;
			var state = gameData[i].state;
			var settings = this.stateSettings[state];

			(function(n, fn) {
				if(fn != null) {
					callback = function() {
						fn(n);
					}
				}
			})(i, settings.callback);

			var slotYOffset = initialSlotYOffset + i * lobbySlotDistance;
			this.slots[i] = game.add.button(slotXOffset, slotYOffset, "game_slot", callback, null, settings.overFrame, settings.outFrame);
			
			var text = game.add.text(slotXOffset + textXOffset, slotYOffset + textYOffset, settings.text);
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
		socket.emit("host game", {gameId: gameId});
		game.state.start("StageSelect", true, false, gameId);
	},

	updateSlot: function(updateInfo) {
		var settings = this.stateSettings[updateInfo.newState];
		var id = updateInfo.gameId;
		var button = this.slots[id];

		this.labels[id].setText(settings.text);
		button.setFrames(settings.overFrame, settings.outFrame);

		// Change callback of button
		button.onInputUp = new Phaser.Signal();
		button.onInputUp.add(settings.callback, this);
	}
};