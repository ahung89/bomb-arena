var Bomb = require("./bomb");
var TextureUtil = require("../util/texture_util");

var DEFAULT_PLAYER_SPEED = 180;
var PLAYER_SPEED_POWERUP_INCREMENT = 60;

var Player = function(x, y, id, color) {
  this.firstFrame = this.getFrame(color, "01");
	Phaser.Sprite.call(this, game, x, y, TEXTURES, this.firstFrame);

  this.spawnPoint = {x: x, y: y};
  this.id = id;
  this.facing = "down";
  this.anchor.setTo(.5, .5);
  this.bombButtonJustPressed = false;
  this.speed = DEFAULT_PLAYER_SPEED;
  this.firstFrame = this.getFrame(color, "01");

	game.physics.enable(this, Phaser.Physics.ARCADE);

  this.body.setSize(15, 16, 1, 15);

	this.animations.add("down", TextureUtil.getFrames(this.getFrame, color, ["01", "02", "03", "04", "05"]), 10, true);
  this.animations.add("up", TextureUtil.getFrames(this.getFrame, color, ["06", "07", "08", "09", "10"]), 10, true);
  this.animations.add("right", TextureUtil.getFrames(this.getFrame, color, ["11", "12", "13"]), 10, true);
  this.animations.add("left", TextureUtil.getFrames(this.getFrame, color, ["14", "15", "16"]), 10, true);

	game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.handleInput = function() {
  this.handleMotionInput();
  this.handleBombInput();
};

Player.prototype.handleMotionInput = function() {
	  var moving = true;

    game.physics.arcade.collide(this, level.blockLayer);
    game.physics.arcade.collide(this, level.bombs);

  	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
  		this.body.velocity.y = 0;
  		this.body.velocity.x = -this.speed;
  		this.facing = "left";
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
  		this.body.velocity.y = 0;
  		this.body.velocity.x = this.speed;
  		this.facing = "right";
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
  		this.body.velocity.x = 0;
  		this.body.velocity.y = -this.speed;
  		this.facing = "up";
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
  		this.body.velocity.x = 0;
  		this.body.velocity.y = this.speed;
  		this.facing = "down";
  	} else {
      moving = false;
  		this.freeze();
  	}

  	if(moving)  {
      this.animations.play(this.facing);
      socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing});
    }
  };

  Player.prototype.handleBombInput = function() {
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !game.physics.arcade.overlap(this, level.bombs) && !this.bombButtonJustPressed) {
      this.bombButtonJustPressed = true;

      // Bombs for a player are identified by timestamp.
      socket.emit("place bomb", {x: this.body.position.x, y: this.body.position.y, id: game.time.now});
    } else if(!game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.bombButtonJustPressed) {
      this.bombButtonJustPressed = false;
    }
  };

  Player.prototype.freeze = function() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.stop();
  };

  Player.prototype.applySpeedPowerup = function() {
    this.speed += PLAYER_SPEED_POWERUP_INCREMENT;
  };

  Player.prototype.getFrame = function (prefix, number) {
      return "gamesprites/bomberman_" + prefix + "/bomberman_" + prefix + "_" + number + ".png";
  };

  Player.prototype.reset = function() {
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
    this.frame = this.firstFrame;
    this.facing = "down";
    this.bombButtonJustPressed = false;
    this.speed = DEFAULT_PLAYER_SPEED;

    if(!this.alive) {
      this.revive();
    }
  };

module.exports = Player;