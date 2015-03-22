var TextConfigurer = require('../util/text_configurer');

function GameOver() {
}

GameOver.prototype = {
	init: function(winnerColor) {
		this.winnerColor = winnerColor;
	},

	create: function() {
		var text = game.add.text(game.camera.width / 2, game.camera.height / 2, "Game Over. Winner: " + this.winnerColor);
		text.anchor.setTo(0.5, 0.5);
		TextConfigurer.configureText(text, "white", 28);
	}
}

module.exports = GameOver;