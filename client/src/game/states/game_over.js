var TextConfigurer = require('../util/text_configurer');

function GameOver() {
}

GameOver.prototype = {
	init: function(winner) {
		this.winner = winner;
	},

	create: function() {
		var text = game.add.text(game.camera.width / x, game.camera.height / 2, "Game Over. Winner is " + this.winner);
		text.anchor.setTo(0.5, 0.5);
		TextConfigurer.configureText(text, "white", 28);
	}
}

module.exports = GameOver;