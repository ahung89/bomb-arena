var Fader = require("../util/fader");

function TitleScreen() {};

var titleOffsetX = 55;
var titleOffsetY = 20;

var buttonOffsetX = 40;
var startButtonOffsetY = 275;
var howToButtonOffsetY = 360;

var bombermanOffsetX = 305;
var bombermanOffsetY = 265;

var firstBombOffsetX = bombermanOffsetX + 12;
var firstBombOffsetY = bombermanOffsetY + 57;

var secondBombOffsetX = bombermanOffsetX + 185;
var secondBombOffsetY = bombermanOffsetY + 141;

var cloudRightmostPointX = 700;

var cloudTweenDuration = 80000;

var cloudData = [
	{startingX: 400, startingY: 50, image: "cloud1"},
	{startingX: -150, startingY: 140, image: "cloud1"},
	{startingX: 375, startingY: 200, image: "cloud1"},
	{startingX: 330, startingY: -20, image: "cloud1"},
	{startingX: 110, startingY: 110, image: "cloud2"},
	{startingX: -300, startingY: 140, image: "cloud2"},
	{startingX: -300, startingY: -30, image: "cloud2"},
	{startingX: 0, startingY: 140, image: "cloud3"},
	{startingX: -75, startingY: 200, image: "cloud4"},
	{startingX: 200, startingY: 20, image: "cloud5"},
	{startingX: 100, startingY: -20, image: "cloud5"},
	{startingX: -200, startingY: 250, image: "cloud6"},
	{startingX: 40, startingY: 80, image: "cloud7"},
	{startingX: 200, startingY: 180, image: "cloud1"},
	{startingX: -150, startingY: 20, image: "cloud5"},
	{startingX: 300, startingY: 230, image: "cloud4"}
];

TitleScreen.prototype = {
	create: function() {
		this.showingInstructions = false;
		this.justClickedHowTo = false;
		this.justClickedOutOfHowTo = false;

		this.createClouds();
		this.createButtons();
	
		var startButtonTween = this.createInitialButtonTween(this.startButton, 200);
		var howToButtonTween = this.createInitialButtonTween(this.howToButton, 400);
	
		var title = game.add.image(titleOffsetX, titleOffsetY - 200, TEXTURES, "titlescreen/title.png");
	
		var titleTween = game.add.tween(title);
		titleTween.to({y: titleOffsetY}, 500, Phaser.Easing.Bounce.Out, true, 200).start();
	
		var bomberman = game.add.sprite(bombermanOffsetX + 400, bombermanOffsetY, TEXTURES, "titlescreen/bomberman/bomberman_01.png");
		bomberman.animations.add("bomb_animation", [
				"titlescreen/bomberman/bomberman_01.png",
				"titlescreen/bomberman/bomberman_02.png",
				"titlescreen/bomberman/bomberman_03.png",
				"titlescreen/bomberman/bomberman_04.png",
				"titlescreen/bomberman/bomberman_05.png"
			], 5, true);
	
		var bombermanTween = game.add.tween(bomberman).to({x: bombermanOffsetX}, 300, Phaser.Easing.Default, false, 100);
		bombermanTween.onComplete.addOnce(function() {
			bomberman.animations.play("bomb_animation");
		});
	
		bombermanTween.start();
		startButtonTween.start();
		howToButtonTween.start();
	},

	createInitialButtonTween: function(button, delay) {
		return game.add.tween(button).to({x: buttonOffsetX}, 300, Phaser.Easing.Default, false, delay);
	},

	createClouds: function() {
		var cloudRightmostPoint = game.camera.width;
		var cloudLeftmostPointX = -260;
		var tweenDuration = cloudTweenDuration * (game.camera.width - cloudLeftmostPointX) / game.camera.width;

		game.add.image(0, 0, TEXTURES, "titlescreen/background.png");

		for(var x = 0; x < cloudData.length; x++) {
			(function(data) {
				var cloudImage = game.add.image(data.startingX, data.startingY, TEXTURES, "titlescreen/" + data.image + ".png");
				cloudImage.anchor.setTo(0, 0);

				var initialTweenDuration = cloudTweenDuration * (game.camera.width - data.startingX) / game.camera.width;
				var cloudTween = game.add.tween(cloudImage).to({x: cloudRightmostPointX}, initialTweenDuration, Phaser.Easing.Default, true, 0, 0);

				var completionFunction = function() {
					cloudImage.x = cloudLeftmostPointX;
					game.add.tween(cloudImage).to({x: cloudRightmostPointX}, tweenDuration, Phaser.Easing.Default, true, 0, -1).start();	
				};

				cloudTween.onComplete.addOnce(completionFunction);
				cloudTween.start();
			})(cloudData[x]);
		};
	},

	createButtons: function() {
		this.startButton = game.add.button(buttonOffsetX - 250, startButtonOffsetY, TEXTURES, function() {
			if(!this.showingInstructions && !this.justClickedOutOfHowTo) {
				Fader.fadeOut(function() {
					game.state.start("Lobby");
				});
			}
		}, this, "titlescreen/buttons/startbutton_02.png", "titlescreen/buttons/startbutton_01.png");
		this.startButton.setDownSound(buttonClickSound);

		this.howToButton = game.add.button(buttonOffsetX - 250, howToButtonOffsetY, TEXTURES, function() {
			if(!this.showingInstructions && !this.justClickedOutOfHowTo) {
				this.showingInstructions = true;
				Fader.fadeOut(function() {
					this.howTo = game.add.image(0, 0, TEXTURES, "titlescreen/howtoplay.png");
					this.justClickedHowTo = true;
					Fader.fadeIn();
				}, this);
			}
		}, this, "titlescreen/buttons/howtobutton_02.png", "titlescreen/buttons/howtobutton_01.png");
		this.howToButton.setDownSound(buttonClickSound);
	},

	update: function() {
		if(!game.input.activePointer.isDown && this.justClickedHowTo) {
			this.justClickedHowTo = false;
		}

		if(!game.input.activePointer.isDown && this.justClickedOutOfHowTo) {
			this.justClickedOutOfHowTo = false;
		}

		if(game.input.activePointer.isDown && this.showingInstructions && !this.justClickedHowTo) {
			buttonClickSound.play();
			this.showingInstructions = false;
			this.justClickedOutOfHowTo = true;
			Fader.fadeOut(function() {
				this.howTo.destroy();
				Fader.fadeIn();
			}, this);
		}
	}
}

module.exports = TitleScreen;