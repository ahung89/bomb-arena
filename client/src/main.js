window.game = new Phaser.Game(600, 600, Phaser.AUTO, '');
window.player = null;
window.socket = null;
window.level = null;
window.TEXTURES = "bbo_textures";

startGame();

function startGame() {
     // socket = io("http://localhost:8000");
	socket = io("https://moa-bomberman.herokuapp.com:443");

    require("./game/mods/phaser_enhancements");

	game.state.add("Boot", require("./game/states/boot"));
	game.state.add("Preloader", require("./game/states/preloader"));
	game.state.add("TitleScreen", require("./game/states/title_screen"));
	game.state.add("Lobby", require("./game/states/lobby"));
	game.state.add("StageSelect", require("./game/states/stage_select"));
	game.state.add("PendingGame", require("./game/states/pending_game"));
	game.state.add("Level", require("./game/states/level"));
	game.state.add("GameOver", require("./game/states/game_over"));

	game.state.start('Boot');
};