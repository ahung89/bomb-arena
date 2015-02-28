var StageSelect = function() {};

module.exports = StageSelect;

var xOffset = 40;
var yOffset = 50;

var thumbnailXOffset = 255;
var thumbnailYOffset = 150;

var stageNameYOffset = 328;

var stages = [
	{name: "Limitless Brook", thumbnailKey: "limitless_brook_thumbnail", tilemapName: "levelOne", maxPlayers: 2, size: "small"}
];

StageSelect.prototype = {
	init: function(gameId) {
		this.gameId = gameId;
	},

	create: function() {
		this.repeatingBombTilesprite = game.add.tileSprite(0, 0, 608, 608, "repeating_bombs");
		var selectionWindow = game.add.image(xOffset, yOffset, "select_stage");
		this.selectedStage = stages[0];

		this.leftButton = game.add.button(150, 180, "left_select_button", null, null, 1, 0);
		this.rightButton = game.add.button(400, 180, "right_select_button", null, null, 1, 0);
		this.okButton = game.add.button(495, 460, "ok_button", this.confirmStageSelection, this, 1, 0);

		this.loadStageInfo(stages[0]);
	},

	update: function() {
		this.repeatingBombTilesprite.tilePosition.x++;
		this.repeatingBombTilesprite.tilePosition.y--;
	},

	loadStageInfo: function(stage) {
		// Display Title
		this.thumbnail = game.add.image(thumbnailXOffset, thumbnailYOffset, stage.thumbnailKey);
		var text = game.add.text(game.camera.width / 2, stageNameYOffset, stage.name);
		this.configureText(text, "white", 28);
		text.anchor.setTo(.5, .5);

		// Display number of players
		var numPlayersText = game.add.text(145, 390, "Max # of players:   " + stage.maxPlayers);
		this.configureText(numPlayersText, "white", 18);

		// Display stage size
		var stageSizeText = game.add.text(145, 420, "Map size:   " + stage.size);
		this.configureText(stageSizeText, "white", 18);
	},

	configureText: function(text, color, size) {
		text.font = "Carter One";
		text.fill = color;
		text.fontSize = size;
	},

	confirmStageSelection: function() {
		game.state.start("PendingGame", true, false, this.selectedStage.tilemapName);
	}
};