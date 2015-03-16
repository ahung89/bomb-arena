var DEFAULT_NUM_ROUNDS = 3;

var Game = function() {
	this.players = {};
	this.map = {};
	this.bombs = {};
	this.numPlayersAlive = 0;

	this.numRounds = DEFAULT_NUM_ROUNDS;
	this.currentRound = 1;
};

Game.prototype = {
	calculateRoundWinner: function() {
		for(var i in this.players) {
			if(this.players[i].alive) {
				return this.players[i];
			}
		}
	},

	calculateGameWinners: function() {
		var winners = [];
		var maxWinCount = 0;

		for(var i in this.players) {
			if(this.players[i].wins > maxWinCount) {
				winners = [this.players[i]];
				maxWinCount = this.players[i].wins;
			} else if (this.players[i].wins == maxWinCount) {
				winners.push(this.players[i]);
			}
		}

		return winners;
	}
};

module.exports = Game;