var xOffset = 100;
var yOffset = 100;

var labelTextXOffset = 150;
var labelTextYOffset = 105;

// TODO: Refactor this method into a utility class, since it's already being used elsewhere (in lobby.js).
function configureText(text, color, size) {
	text.font = "Carter One";
	text.fill = color;
	text.fontSize = size;
};

function RoundEndAnimation(game, roundNumber) {
	Phaser.Group.call(this, game);

	var roundEndWindow = game.add.image(xOffset, yOffset, "round_end_display");
	var header = game.add.text(labelTextXOffset, labelTextYOffset, "Round " + roundNumber + " Complete!")
	configureText(header, "white", 32);

	this.add(roundEndWindow);
	this.add(header);
};

RoundEndAnimation.prototype = Object.create(Phaser.Group.prototype);

module.exports = RoundEndAnimation;