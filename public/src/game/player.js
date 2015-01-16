var Player = function(x, y) {
	Phaser.Sprite.call(this, game, x, y, 'bomberman');

	game.physics.enable(this, Phaser.Physics.ARCADE);
	this.animations.add('down', [0, 1, 2, 3, 4], 10, true);
  	this.animations.add('up', [5, 6, 7, 8, 9], 10, true);
  	this.animations.add('right', [10, 11, 12], 10, true);
  	this.animations.add('left', [13, 14, 15], 10, true);

	game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.move = function() {
	var direction;

  	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
  		player.body.velocity.y = 0;
  		player.body.velocity.x = -200;
  		direction = 'left';
  		// player.animations.play('left');
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
  		player.body.velocity.y = 0;
  		player.body.velocity.x = 200;
  		direction = 'right';
  		// player.animations.play('right');
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
  		player.body.velocity.x = 0;
  		player.body.velocity.y = -200;
  		direction = 'up';
  		// player.animations.play('up');
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
  		player.body.velocity.x = 0;
  		player.body.velocity.y = 200;
  		direction = 'down';
  		// player.animations.play('down');
  	} else {
  		player.body.velocity.x = 0;
  		player.body.velocity.y = 0;
  		player.animations.stop();
  	}

  	if(direction) 
  		player.animations.play(direction);
  };

module.exports = Player;