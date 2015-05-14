function TitleScreen() {};

var titleOffsetX = 55;
var titleOffsetY = 20;

var bombermanOffsetX = 305;
var bombermanOffsetY = 265;

var firstBombOffsetX = bombermanOffsetX + 12;
var firstBombOffsetY = bombermanOffsetY + 57;

var secondBombOffsetX = bombermanOffsetX + 185;
var secondBombOffsetY = bombermanOffsetY + 141;

var cloudRightmostPointX = 700;

var cloudData = [
	{startingX: 350, startingY: 30, image: "cloud1", delay: 16000, direction: "left"},
	{startingX: 110, startingY: 80, image: "cloud2", delay: 15000, direction: "right"},
	{startingX: -50, startingY: 120, image: "cloud3", delay: 14000, direction: "right"},
	{startingX: -100, startingY: 160, image: "cloud4", delay: 12000, direction: "right"},
	{startingX: 800, startingY: 200, image: "cloud5", delay: 13000, direction: "left"},
	{startingX: 500, startingY: 250, image: "cloud6", delay: 16000, direction: "left"},
	{startingX: -150, startingY: 50, image: "cloud7", delay: 12000, direction: "right"}
];

TitleScreen.prototype = {
	create: function() {
		var cloudRightmostPoint = game.camera.width + 100;

		game.add.image(0, 0, "titlescreen_bg");

		for(var x = 0; x < cloudData.length; x++) {
			(function(data) {
				var cloudImage = game.add.image(data.startingX, data.startingY, data.image);

				var cloudLeftmostPointX = 0 - cloudImage.width;
				var loopStartingX = data.direction == "left" ? cloudRightmostPointX : cloudLeftmostPointX;
				var endingX = data.direction == "left" ? cloudLeftmostPointX : cloudRightmostPointX;

				var cloudTween = game.add.tween(cloudImage).to({x: endingX}, data.delay, Phaser.Easing.Default, true, 0, 0);

				cloudTween.onComplete.addOnce(function() {
					cloudImage.x = loopStartingX;
					game.add.tween(cloudImage).to({x: endingX}, data.delay, Phaser.Easing.Default, true, 0, -1).start();
				});
				cloudTween.start();
			})(cloudData[x]);
		};

		var title = game.add.image(titleOffsetX, titleOffsetY - 200, "titlescreen_title");

		var titleTween = game.add.tween(title);
		titleTween.to({y: titleOffsetY}, 300).start();

		var bomberman = game.add.sprite(bombermanOffsetX, bombermanOffsetY, "titlescreen_bomberman");
		bomberman.animations.add("bomb_animation", [0, 1, 2, 3, 4], 5, true);
		bomberman.animations.play("bomb_animation");
	},

	update: function() {

	}
}

module.exports = TitleScreen;