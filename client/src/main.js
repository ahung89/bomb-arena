window.game = new Phaser.Game(800, 480, Phaser.CANVAS, '');
window.socket; //Refactor socket stuff into its own class?
window.player;
window.remotePlayers = {};

startGame();

function startGame() {
	game.state.add('Boot', require('./game/states/Boot'));
	game.state.add('Preloader', require('./game/states/Preloader'));
	game.state.add('Level', require('./game/states/Level'));

	game.state.start('Boot');
};