var StageSelect = function() {};

module.exports = StageSelect;

var xOffset = 40;
var yOffset = 50;

var thumbnailXOffset = 255;
var thumbnailYOffset = 150;

var stages = [
	{name: "Limitless Brook", thumbnailKey: "limitless_brook_thumbnail", maxPlayers: 2, size: "small"}
];

StageSelect.prototype = {
	create: function() {
		game.add.image(xOffset, yOffset, "select_stage");
		this.thumbnail = game.add.image(thumbnailXOffset, thumbnailYOffset, "limitless_brook_thumbnail");
		var text = game.add.text(game.camera.width / 2, 325, "Limitless Brook");
		text.anchor.setTo(.5, .5);
		text.font = "Carter One";
		text.fontSize = 28;
	},

	update: function() {

	},

	loadStageInfo: function() {

	}
};