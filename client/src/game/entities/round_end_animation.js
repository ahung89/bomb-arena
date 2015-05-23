var TextConfigurer = require('../util/text_configurer');

var screenWidth = 600;

var xOffset = 100 - screenWidth;
var yOffset = 60;

var headerXOffset = 150 - screenWidth;
var headerYOffset = 65;

var winnerPicXOffset = 225 - screenWidth;
var winnerPicYOffset = 310;

var defaultTextXOffset = 220 - screenWidth;
var defaultTextYOffset = 220;

var singleWinnerText = "Winner is...";
var roundEndTieText = "Draw! Winners are...";

function RoundEndAnimation(game, roundNumber, winningColors) {
	Phaser.Group.call(this, game);

	var roundEndWindow = game.add.image(xOffset, yOffset, TEXTURES, "lobby/end_of_round_window.png");

	var header = game.add.text(headerXOffset, headerYOffset, "Round " + roundNumber + " Complete!")
	TextConfigurer.configureText(header, "white", 32);

	// Text and offset differ based on whether or not there was a tie.
	var actualTextXOffset = winningColors.length > 1 ? defaultTextXOffset - 55 : defaultTextXOffset;
	var actualTextToDisplay = winningColors.length > 1 ? roundEndTieText : singleWinnerText;

	var textObject = game.add.text(actualTextXOffset, defaultTextYOffset, actualTextToDisplay);
	TextConfigurer.configureText(textObject, "white", 28);
	textObject.alpha = 0;

	this.add(roundEndWindow);
	this.add(header);
	this.add(textObject);
	
	this.createAndAddWinnerImages(winningColors);
};

RoundEndAnimation.prototype = Object.create(Phaser.Group.prototype);

RoundEndAnimation.prototype.createAndAddWinnerImages = function(winningColors) {
	this.winnerImageIndices = [];
	var index = 3; // 3 is the index of the first winner image.

	winningColors.forEach(function(color) {
		var winnerPicImage = new Phaser.Image(game, winnerPicXOffset, winnerPicYOffset, TEXTURES, "lobby/bomberman_head/bomberman_head_" + color + ".png");

		winnerPicImage.scale = {x: 1.75, y: 1.75};
		winnerPicImage.alpha = 0;

		game.add.existing(winnerPicImage);
		this.add(winnerPicImage);
		this.winnerImageIndices.push(index++);
	}, this);
};

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

	var exitTween = game.add.tween(this);
	exitTween.to({x: 2 * screenWidth}, 300, Phaser.Easing.Default, false, 200);
	exitTween.onComplete.addOnce(function() {
		callback();
		this.destroy();
	}, this);

	var winnerDisplayTween = this.generateWinnerImageTween(this.winnerImageIndices, exitTween);

	entranceTween.start();
};

// TODO: Make it so that the very last winner image tween doesn't fade out.
RoundEndAnimation.prototype.generateWinnerImageTween = function(indices, nextTween) {
	var winnerImageTweens = [];
	var ctx = this;
	for (var i = 0; i < indices.length; i++) {
		(function(n) {
			var tween = game.add.tween(ctx.children[indices[n]]);
			tween.to({alpha: 1}, 900);
			if(i < indices.length - 1) {
				tween.to({alpha: 0}, 900);
				tween.onComplete.addOnce(function() {
					winnerImageTweens[n + 1].start();
				});
			} else {
				tween.onComplete.addOnce(function() {
					nextTween.start();
				}, ctx);
			}
	
			winnerImageTweens.push(tween);
		})(i);
	}

	return winnerImageTweens[0];
};

module.exports = RoundEndAnimation;