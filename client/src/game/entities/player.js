var Bomb = require('./Bomb');

var Player = function(x, y) {
	Phaser.Sprite.call(this, game, x, y, 'bomberman');

  this.facing = 'down';
  this.anchor.setTo(.5, .5);
  this.bombs = game.add.group();

	game.physics.enable(this, Phaser.Physics.ARCADE);
  game.physics.enable(this.bombs, Phaser.Physics.ARCADE);

	this.animations.add('down', [0, 1, 2, 3, 4], 10, true);
  	this.animations.add('up', [5, 6, 7, 8, 9], 10, true);
  	this.animations.add('right', [10, 11, 12], 10, true);
  	this.animations.add('left', [13, 14, 15], 10, true);

	game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.handleInput = function() {
  this.handleMotionInput();
  this.handleBombInput();
};

Player.prototype.handleMotionInput = function() {
	  var moving = true;;

  	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
  		this.body.velocity.y = 0;
  		this.body.velocity.x = -200;
  		this.facing = 'left';
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
  		this.body.velocity.y = 0;
  		this.body.velocity.x = 200;
  		this.facing = 'right';
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
  		this.body.velocity.x = 0;
  		this.body.velocity.y = -200;
  		this.facing = 'up';
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
  		this.body.velocity.x = 0;
  		this.body.velocity.y = 200;
  		this.facing = 'down';
  	} else {
      moving = false;
  		this.body.velocity.x = 0;
  		this.body.velocity.y = 0;
  		this.animations.stop();
  	}

  	if(moving)  {
      this.animations.play(this.facing);
      socket.emit("move player", {x: this.body.position.x, y: this.body.position.y, facing: this.facing});
    }
  };

  Player.prototype.handleBombInput = function() {
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !game.physics.arcade.overlap(this, this.bombs)) {
      this.bombs.add(new Bomb(this.position.x, this.position.y));
    }
  };

module.exports = Player;