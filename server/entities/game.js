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

	calculateGameWinnerColors: function() {
		var winningColors = [];
		var maxWinCount = 0;

		for(var i in this.players) {
			if(this.players[i].wins > maxWinCount) {
				winningColors = [this.players[i].color];
				maxWinCount = this.players[i].wins;
			} else if (this.players[i].wins == maxWinCount) {
				winningColors.push(this.players[i].color);
			}
		}

		return winningColors;
	},

	resetBombs: function() {
		for(var bombId in this.bombs) {
			clearTimeout(this.bombs[bombId].explosionTimerId);
		}
		this.bombs = {};
	}
};

module.exports = Game;