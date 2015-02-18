var Lobby = function() {};

var initialSlotYOffset = 115;
var slotXOffset = 25;
var lobbySlotDistance = 110;
var numLobbySlots = 4;

var buttonYOffsetWithinSlot = 34;
var buttonXOffsetWithinSlot = 400;

module.exports = Lobby;

Lobby.prototype = {
	create: function() {
		this.slots = [];
		this.buttons = [];

		this.addSlots();
		this.addButtons();
	},

	update: function() {

	},

	addSlots: function() {
		for(var i = 0; i < numLobbySlots; i++) {
			this.slots[i] = game.add.sprite(slotXOffset, initialSlotYOffset + i * lobbySlotDistance, "lobby_slot");
		}
	},

	addButtons: function() {
		for(var i = 0; i < numLobbySlots; i++) {
			this.buttons[i] = game.add.button(slotXOffset + buttonXOffsetWithinSlot, 
				initialSlotYOffset + i * lobbySlotDistance + buttonYOffsetWithinSlot,
				 "join_button", null, null, 1, 0);
		}
	}
};