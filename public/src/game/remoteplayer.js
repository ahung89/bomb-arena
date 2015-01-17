var RemotePlayer = function(x, y, id) {
	this.id = id;
	this.lastMoveTime = 0;

	Phaser.Sprite.call(this, game, x, y, "bomberman");

	game.physics.enable(this, Phaser.Physics.ARCADE);

	this.animations.add('down', [0, 1, 2, 3, 4], 10, true);
  	this.animations.add('up', [5, 6, 7, 8, 9], 10, true);
  	this.animations.add('right', [10, 11, 12], 10, true);
  	this.animations.add('left', [13, 14, 15], 10, true);

	game.add.existing(this);
};

RemotePlayer.prototype = Object.create(Phaser.Sprite.prototype);

module.exports = RemotePlayer;