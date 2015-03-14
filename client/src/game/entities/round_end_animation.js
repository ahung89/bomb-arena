var xOffset = 100;
var yOffset = 60;

var headerXOffset = 150;
var headerYOffset = 65;

var winnerPicXOffset = 225;
var winnerPicYOffset = 310;

// TODO: Refactor this method into a utility class, since it's already being used elsewhere (in lobby.js).
function configureText(text, color, size) {
	text.font = "Carter One";
	text.fill = color;
	text.fontSize = size;
};

function RoundEndAnimation(game, roundNumber, winnerImage) {
	Phaser.Group.call(this, game);

	var roundEndWindow = game.add.image(xOffset, yOffset, "round_end_display");
	var header = game.add.text(headerXOffset, headerYOffset, "Round " + roundNumber + " Complete!")
	configureText(header, "white", 32);

	// TEST CODE, DAWG
	var winnerPicImage = new Phaser.Image(game, winnerPicXOffset, winnerPicYOffset, "bomberman_head_blue");
	winnerPicImage.scale = {x: 1.75, y: 1.75};
	game.add.existing(winnerPicImage);

	this.add(roundEndWindow);
	this.add(header);
	this.add(winnerPicImage);
};

RoundEndAnimation.prototype = Object.create(Phaser.Group.prototype);

module.exports = RoundEndAnimation;