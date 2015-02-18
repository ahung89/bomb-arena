var Lobby = function() {};

var initialSlotYOffset = 115;
var slotXOffset = 25;
var lobbySlotDistance = 110;
var numLobbySlots = 4;

module.exports = Lobby;

Lobby.prototype = {
	create: function() {
		this.slots = [];
		this.buttons = [];
		
		this.drawSlots();
	},

	update: function() {

	},

	drawSlots: function() {
		for(var i = 0; i < numLobbySlots; i++) {
			this.slots[i] = game.add.sprite(slotXOffset, initialSlotYOffset + i * lobbySlotDistance, "lobby_slot");
		}
	}
};