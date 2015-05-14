function TitleScreen() {};

var titleOffsetX = 55;
var titleOffsetY = 20;

var bombermanOffsetX = 305;
var bombermanOffsetY = 265;

var firstBombOffsetX = bombermanOffsetX + 12;
var firstBombOffsetY = bombermanOffsetY + 57;

var secondBombOffsetX = bombermanOffsetX + 185;
var secondBombOffsetY = bombermanOffsetY + 141;

TitleScreen.prototype = {
	create: function() {
		game.add.image(0, 0, "titlescreen_bg");

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