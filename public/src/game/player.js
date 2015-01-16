var Player = function(x, y) {
	Phaser.Sprite.call(this, game, x, y, 'bomberman');

	game.physics.enable(this, Phaser.Physics.ARCADE);

	game.add.existing(this);
};

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);