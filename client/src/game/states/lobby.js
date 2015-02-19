var Lobby = function() {};

var initialSlotYOffset = 115;
var slotXOffset = 25;
var lobbySlotDistance = 110;

var buttonYOffsetWithinSlot = 34;
var buttonXOffsetWithinSlot = 400;

module.exports = Lobby;

Lobby.prototype = {
	create: function() {
		this.slots = [];
		this.buttons = [];

		var gameData = [{numPlayers: 0}, {numPlayers: 0}, {numPlayers: 1}, {numPlayers: 0}];

		this.addSlots(gameData);
		this.addButtons(gameData);
	},

	update: function() {

	},

	addSlots: function(gameData) {
		for(var i = 0; i < gameData.length; i++) {
			var frame = gameData[i].numPlayers == 0 ? 0 : 1;
			this.slots[i] = game.add.sprite(slotXOffset, initialSlotYOffset + i * lobbySlotDistance, "lobby_slot", frame);
		}
	},

	addButtons: function(gameData) {
		for(var i = 0; i < gameData.length; i++) {
			this.buttons[i] = game.add.button(slotXOffset + buttonXOffsetWithinSlot, 
				initialSlotYOffset + i * lobbySlotDistance + buttonYOffsetWithinSlot,
				 "host_button", this.hostGameAction, null, 1, 0);
		}
	},

	hostGameAction: function() {
		game.state.start("StageSelect");
	}
};