var PendingGame = function() {
	this.players = {};
	this.state = "empty";
	this.mapName = "";
	this.availableColors = ["white", "blue", "green", "purple", "red"];
};

PendingGame.prototype = {
	getPlayerIds: function() {
		return Object.keys(this.players);
	},

	getNumPlayers: function() {
		return Object.keys(this.players).length;
	},

	removePlayer: function(id) {
		this.availableColors.unshift(this.players[id].color);
		delete this.players[id];
	},

	addPlayer: function(id) {
		this.players[id] = {color: this.availableColors.shift()};
	}
};

module.exports = PendingGame;