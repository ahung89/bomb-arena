var Player = require('../Player');

var Level = function () {};

module.exports = Level;

Level.prototype = {

  preload: function () {
    this.load.spritesheet("bomberman", "assets/sprites/bomberman.png", 28, 50);
  },

  create: function () {
  	socket = io("http://localhost:8120"); // By default, this connects to the local host.
    
    player = new Player(game.camera.width / 2, game.camera.height / 2);

    this.initializeAnimations();
  },

  initializeAnimations: function() {
  	player.animations.add('down', [0, 1, 2, 3, 4], 10, true);
  	player.animations.add('up', [5, 6, 7, 8, 9], 10, true);
  	player.animations.add('right', [10, 11, 12], 10, true);
  	player.animations.add('left', [13, 14, 15], 10, true);
  },

  update: function() {
  	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
  		player.body.velocity.y = 0;
  		player.body.velocity.x = -200;
  		player.animations.play('left');
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
  		player.body.velocity.y = 0;
  		player.body.velocity.x = 200;
  		player.animations.play('right');
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
  		player.body.velocity.x = 0;
  		player.body.velocity.y = -200;
  		player.animations.play('up');
  	} else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
  		player.body.velocity.x = 0;
  		player.body.velocity.y = 200;
  		player.animations.play('down');
  	} else {
  		player.body.velocity.x = 0;
  		player.body.velocity.y = 0;
  		player.animations.stop();
  	}
  }
};
