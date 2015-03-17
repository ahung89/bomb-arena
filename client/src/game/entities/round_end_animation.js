var screenWidth = game.width;

var xOffset = 100 - screenWidth;
var yOffset = 60;

var headerXOffset = 150 - screenWidth;
var headerYOffset = 65;

var winnerPicXOffset = 225 - screenWidth;
var winnerPicYOffset = 310;

var winnerTextXOffset = 220 - screenWidth;
var winnerTextYOffset = 220;

var textToDisplay = "Winner is..."; // Default text to display
var roundEndTieText = "Draw! Winners are...";

// TODO: Refactor this method into a utility class, since it's already being used elsewhere (in lobby.js).
function configureText(text, color, size) {
	text.font = "Carter One";
	text.fill = color;
	text.fontSize = size;
};

// TODO: have it take an array "winnerColors", initialize/play animation slightly differently in each case
function RoundEndAnimation(game, roundNumber, winningColors) {
	Phaser.Group.call(this, game);

	var roundEndWindow = game.add.image(xOffset, yOffset, "round_end_display");

	var header = game.add.text(headerXOffset, headerYOffset, "Round " + roundNumber + " Complete!")
	configureText(header, "white", 32);

	if(winningColors.length > 1) {
		textToDisplay = roundEndTieText;
		winnerTextXOffset -= 55; // Adjust offset so that it is still centered.
	}

	var textObject = game.add.text(winnerTextXOffset, winnerTextYOffset, textToDisplay);
	configureText(textObject, "white", 28);
	textObject.alpha = 0;

	var winnerPicImage = new Phaser.Image(game, winnerPicXOffset, winnerPicYOffset, "bomberman_head_");
	winnerPicImage.scale = {x: 1.75, y: 1.75};
	winnerPicImage.alpha = 0;
	game.add.existing(winnerPicImage);

	this.add(roundEndWindow);
	this.add(header);
	this.add(textObject);
	this.add(winnerPicImage);
};

RoundEndAnimation.prototype = Object.create(Phaser.Group.prototype);

RoundEndAnimation.prototype.beginAnimation = function(callback) {
	var entranceTween = game.add.tween(this);
	entranceTween.to({x: screenWidth}, 300);
	entranceTween.onComplete.addOnce(function() {
		winnerTextTween.start();
	}, this);

	var winnerTextTween = game.add.tween(this.children[2]);
	winnerTextTween.to({alpha: 1}, 800);
	winnerTextTween.onComplete.addOnce(function() {
		winnerDisplayTween.start();
	}, this);

	var winnerDisplayTween = game.add.tween(this.children[3]);
	winnerDisplayTween.to({alpha: 1}, 800);
	winnerDisplayTween.onComplete.addOnce(function() {
		exitTween.start();
	}, this);

	var exitTween = game.add.tween(this);
	exitTween.to({x: 2 * screenWidth}, 300, null, false, 400);
	exitTween.onComplete.addOnce(callback);

	entranceTween.start();
};

module.exports = RoundEndAnimation;