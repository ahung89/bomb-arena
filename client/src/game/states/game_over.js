var TextConfigurer = require('../util/text_configurer');

function GameOver() {
}

GameOver.prototype = {
	init: function(winnerColor, winByDefault) {
		this.winnerColor = winnerColor;
		this.winByDefault = winByDefault;
	},

	create: function() {
		var textToDisplay = this.winByDefault ? "     No other players remaining.\n              You win by default." : "       Game Over. Winner: " + this.winnerColor;
		textToDisplay += "\n\nPress Enter to return to main menu.";
		var textObject = game.add.text(game.camera.width / 2, game.camera.height / 2, textToDisplay);
		textObject.anchor.setTo(0.5, 0.5);
		TextConfigurer.configureText(textObject, "white", 28);
	},

	update: function() {
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.returnToLobby();
		}
	},

	returnToLobby: function() {
		game.state.start("Lobby");
	}
}

module.exports = GameOver;