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
		console.log("removing player. colors was previously");
		console.log(this.availableColors);
		this.availableColors.unshift(this.players[id].color);
		console.log("now it be ");
		console.log(this.availableColors);
		delete this.players[id];
	},

	addPlayer: function(id) {
		var color = this.availableColors.shift();
		console.log("creating new player. his color is " + color);
		this.players[id] = {color: color};
	}
};

module.exports = PendingGame;