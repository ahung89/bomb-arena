var StageSelect = function() {};

module.exports = StageSelect;

var xOffset = 40;
var yOffset = 50;

var thumbnailXOffset = 255;
var thumbnailYOffset = 150;

var stageNameYOffset = 328;

var repeatingBombTilesprite;

var stages = [
	{name: "Limitless Brook", thumbnailKey: "thumbnails/limitless_brook_thumbnail.png", tilemapName: "levelOne", maxPlayers: 4, size: "small"},
	{name: "Danger Desert", thumbnailKey: "thumbnails/danger_desert_thumbnail.png", tilemapName: "levelTwo", maxPlayers: 4, size: "medium"},
	//TODO fix aztec tilemap
	{name: "aztec", thumbnailKey: "thumbnails/danger_desert_thumbnail.png", tilemapName: "aztec", maxPlayers: 4, size: "medium"}
];

StageSelect.prototype = {
	init: function(gameId, rbts) {
		repeatingBombTilesprite = rbts;
		this.gameId = gameId;
	},

	create: function() {
		var selectionWindow = game.add.image(xOffset, yOffset, TEXTURES, "lobby/select_stage.png");
		this.selectedStageIndex = 0;
		var initialStage = stages[this.selectedStageIndex];

		this.leftButton = game.add.button(150, 180, TEXTURES, this.leftSelect, this, "lobby/buttons/left_select_button_02.png", "lobby/buttons/left_select_button_01.png");
		this.rightButton = game.add.button(400, 180, TEXTURES, this.rightSelect, this, "lobby/buttons/right_select_button_02.png", "lobby/buttons/right_select_button_01.png");
		this.okButton = game.add.button(495, 460, TEXTURES, this.confirmStageSelection, this, "lobby/buttons/ok_button_02.png", "lobby/buttons/ok_button_01.png");

		this.leftButton.setDownSound(buttonClickSound);
		this.rightButton.setDownSound(buttonClickSound);
		this.okButton.setDownSound(buttonClickSound);

		this.thumbnail = game.add.image(thumbnailXOffset, thumbnailYOffset, TEXTURES, initialStage.thumbnailKey);

		// Display title
		this.text = game.add.text(game.camera.width / 2, stageNameYOffset, initialStage.name);
		this.configureText(this.text, "white", 28);
		this.text.anchor.setTo(.5, .5);

		// Display number of players
		this.numPlayersText = game.add.text(145, 390, "Max # of players:   " + initialStage.maxPlayers);
		this.configureText(this.numPlayersText, "white", 18);

		// Display stage size
		this.stageSizeText = game.add.text(145, 420, "Map size:   " + initialStage.size);
		this.configureText(this.stageSizeText, "white", 18);
	},

	leftSelect: function() {
		if(this.selectedStageIndex === 0) {
			this.selectedStageIndex = stages.length - 1;
		} else {
			this.selectedStageIndex--;
		}

		this.updateStageInfo();
	},

	rightSelect: function() {
		if(this.selectedStageIndex === stages.length - 1) {
			this.selectedStageIndex = 0;
		} else {
			this.selectedStageIndex++;
		}

		this.updateStageInfo();
	},

	update: function() {
		repeatingBombTilesprite.tilePosition.x++;
		repeatingBombTilesprite.tilePosition.y--;
	},

	updateStageInfo: function() {
		var newStage = stages[this.selectedStageIndex];
		this.text.setText(newStage.name);
		this.numPlayersText.setText("Max # of players:   " + newStage.maxPlayers);
		this.stageSizeText.setText("Map size:   " + newStage.size);
		this.thumbnail.loadTexture(TEXTURES, newStage.thumbnailKey);
	},

	configureText: function(text, color, size) {
		text.font = "Carter One";
		text.fill = color;
		text.fontSize = size;
	},

	confirmStageSelection: function() {
		var selectedStage = stages[this.selectedStageIndex];

		socket.emit("select stage", {mapName: selectedStage.tilemapName});
		game.state.start("PendingGame", true, false, selectedStage.tilemapName, this.gameId, repeatingBombTilesprite);
	}
};