var Bomb = require('./bomb');

var Player = function(x, y) {
	Phaser.Sprite.call(this, game, x, y, 'bomberman');

  this.facing = 'down';
  this.anchor.setTo(.5, .5);

	game.physics.enable(this, Phaser.Physics.ARCADE);

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
      socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing});
    }
  };

  Player.prototype.handleBombInput = function() {
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !game.physics.arcade.overlap(this, level.bombs)) {
      var bomb = new Bomb(this.position.x, this.position.y, game.time.now);

      // Bombs for a player are identified by timestamp.
      level.bombs.add(bomb);
      socket.emit("place bomb", {x: bomb.x, y: bomb.y, id: bomb.id});
    }
  };

module.exports = Player;