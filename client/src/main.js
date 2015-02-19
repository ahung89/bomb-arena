window.game = new Phaser.Game(600, 600, Phaser.CANVAS, '');
window.player = null;
window.socket = null;
window.level = null;

startGame();

function startGame() {
	// socket = io("https://limitless-brook-9339.herokuapp.com:443");
    socket = io("http://localhost:8000");

	game.state.add("Boot", require("./game/states/Boot"));
	game.state.add("Preloader", require("./game/states/Preloader"));
	game.state.add("Lobby", require("./game/states/Lobby"));
	game.state.add("StageSelect", require("./game/states/stage_select"));
	game.state.add("Level", require("./game/states/Level"));

	game.state.start('Boot');
};