var Lobby = function() {};

var TextConfigurer = require("../util/text_configurer");

var initialSlotYOffset = 130;
var slotXOffset = 40;
var lobbySlotDistance = 60;

var textXOffset = 260;
var textYOffset = 25;
var repeatingBombTilesprite;

var headerYOffset = 70;

module.exports = Lobby;

Lobby.prototype = {
	init: function(rbts) {
		repeatingBombTilesprite = rbts;
	},

	create: function() {
		this.stateSettings = {
			empty: {
				outFrame: "lobby/slots/game_slot_01.png",
				overFrame: "lobby/slots/game_slot_02.png",
				text: "Host Game ", // For some reason, text gets slightly truncated if I don't append a space.
				callback: this.hostGameAction
			},
			joinable: {
				outFrame: "lobby/slots/game_slot_03.png",
				overFrame: "lobby/slots/game_slot_04.png",
				text: "Join Game ",
				callback: this.joinGameAction
			},
			settingup: {
				outFrame: "lobby/slots/game_slot_05.png",
				overFrame: "lobby/slots/game_slot_05.png",
				text: "Game is being set up... ",
				callback: null
			},
			inprogress: {
				outFrame: "lobby/slots/game_slot_05.png",
				overFrame: "lobby/slots/game_slot_05.png",
				text: "Game in Progress ",
				callback: null
			},
			full: {
				outFrame: "lobby/slots/game_slot_05.png",
				overFrame: "lobby/slots/game_slot_05.png",
				text: "Game Full ",
				callback: null
			}
		};

		if(repeatingBombTilesprite == null) {
			repeatingBombTilesprite = game.add.tileSprite(0, 0, 608, 608, "repeating_bombs");
		}

		repeatingBombTilesprite.doNotDestroy = true;

		this.backdrop = game.add.image(12.5, 12.5, TEXTURES, "lobby/lobby_backdrop.png");
		this.header = game.add.text(game.camera.width / 2, headerYOffset, "Lobby");
		this.header.anchor.setTo(.5, .5);
		TextConfigurer.configureText(this.header, "white", 32);

		this.slots = [];
		this.labels = [];

		var gameData = [{state: "empty"}, {state: "empty"}, {state: "joinable"}, {state: "insession"}];

		socket.emit("enter lobby");

		if(!socket.hasListeners("add slots")) {
			socket.on("add slots", this.addSlots.bind(this));
			socket.on("update slot", this.updateSlot.bind(this));
		}
	},

	update: function() {
		repeatingBombTilesprite.tilePosition.x++;
		repeatingBombTilesprite.tilePosition.y--;
	},

	addSlots: function(gameData) {
		if(this.slots.length > 0)  // TODO: get rid of this
			return;

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
			this.slots[i] = game.add.button(slotXOffset, slotYOffset, TEXTURES, callback, null, settings.overFrame, settings.outFrame);
			this.slots[i].setDownSound(buttonClickSound);
			
			var text = game.add.text(slotXOffset + textXOffset, slotYOffset + textYOffset, settings.text);
			TextConfigurer.configureText(text, "white", 18);
			text.anchor.setTo(.5, .5);

			this.labels[i] = text;
		}
	},

	hostGameAction: function(gameId) {
		socket.emit("host game", {gameId: gameId});
		socket.removeAllListeners();
		game.state.start("StageSelect", true, false, gameId, repeatingBombTilesprite);
	},

	joinGameAction: function(gameId) {
		socket.removeAllListeners();
		game.state.start("PendingGame", true, false, null, gameId, repeatingBombTilesprite);
	},

	updateSlot: function(updateInfo) {
		var settings = this.stateSettings[updateInfo.newState];
		var id = updateInfo.gameId;
		var button = this.slots[id];

		this.labels[id].setText(settings.text);
		button.setFrames(settings.overFrame, settings.outFrame);

		// Change callback of button
		button.onInputUp.removeAll();
		button.onInputUp.add(function() { return settings.callback(id)}, this);
	}
};