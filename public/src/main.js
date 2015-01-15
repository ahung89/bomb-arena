window.game = new Phaser.Game(800, 480, Phaser.CANVAS, '');

startGame();

function startGame() {
	game.state.add('Boot', require('./game/states/Boot'));
	game.state.add('Preloader', require('./game/states/Preloader'));
	game.state.add('Level', require('./game/states/Level'));

	game.state.start('Boot');
};