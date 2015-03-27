var DEFAULT_NUM_ROUNDS = 3;

var Game = function() {
	this.players = {};
	this.map = {};
	this.bombs = {};
	this.numPlayersAlive = 0;

	// This is used to keep track of how many players have acknowledged the end of a round, to avoid
	// extra socket messages from causing weird behavior.
	this.endOfRoundAcknowledgements = [];
	this.awaitingAcknowledgements = false;

	this.numRounds = DEFAULT_NUM_ROUNDS;
	this.currentRound = 1;
};

Game.prototype = {
	get numPlayers() {
		return Object.keys(this.players).length;
	},

	get numEndOfRoundAcknowledgements() {
		return this.endOfRoundAcknowledgements.length;
	},

	acknowledgeEndOfRoundForPlayer: function(playerId) {
		console.log("indexOf ", playerId, " is ", this.endOfRoundAcknowledgements.indexOf(playerId));
		if(this.endOfRoundAcknowledgements.indexOf(playerId) == -1) {
			this.endOfRoundAcknowledgements.push(playerId);
		}
	},

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

	clearBombs: function() {
		for(var bombId in this.bombs) {
			clearTimeout(this.bombs[bombId].explosionTimerId);
		}
		this.bombs = {};
	},

	resetPlayers: function() {
		for(var i in this.players) {
			var player = this.players[i];
			player.resetForNewRound();
		}
	},

	resetForNewRound: function() {
		this.clearBombs();
		this.resetPlayers();
		this.endOfRoundAcknowledgements = [];
		this.awaitingAcknowledgements = false;
		this.numPlayersAlive = Object.keys(this.players).length;
	}
};

module.exports = Game;