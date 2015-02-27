var PendingGame = function() {}

module.exports = PendingGame;

var xOffset = 40;
var yOffset = 50;

var buttonXOffset = 330;
var startGameButtonYOffset = 400;
var leaveButtonYOffset = 450;

var characterSquareStartingX = 330;
var characterSquareStartingY = 80;
var characterSquareXDistance = 105;
var characterSquareYDistance = 100;
var numCharacterSquares = 6;

PendingGame.prototype = {
	create: function() {
		this.repeatingBombTilesprite = game.add.tileSprite(0, 0, 608, 608, "repeating_bombs");
		var backdrop = game.add.image(xOffset, yOffset, "pending_game_backdrop");
		this.startGameButton = game.add.button(buttonXOffset, startGameButtonYOffset, "start_game_button", null, null,
			1, 0);
		this.leaveGameButton = game.add.button(buttonXOffset, leaveButtonYOffset, "leave_game_button", null, null, 1, 0);
		this.characterSquares = this.drawCharacterSquares(4);
	},

	update: function() {
		this.repeatingBombTilesprite.tilePosition.x++;
		this.repeatingBombTilesprite.tilePosition.y--;
	},

	drawCharacterSquares: function(numOpenings) {
		var characterSquares = [];
		var yOffset = characterSquareStartingY;
		var xOffset = characterSquareStartingX;

		for(var i = 0; i < numCharacterSquares; i++) {
			var frame = i < numOpenings ? 0 : 1;
			characterSquares[i] = game.add.sprite(xOffset, yOffset, "character_square", frame);
			if(i % 2 == 0) {
				xOffset += characterSquareXDistance;
			} else {
				xOffset = characterSquareStartingX;
				yOffset += characterSquareYDistance;
			}
		}
	}
}