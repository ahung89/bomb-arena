var Player = require('../Player');

var Level = function () {};

module.exports = Level;

Level.prototype = {

  preload: function () {
    this.load.spritesheet("bomberman", "assets/sprites/bomberman.png", 28, 50);
  },

  create: function () {
  	socket = io("http://localhost:8120"); // By default, this connects to the local host.
    
    player = new Player(Math.round(Math.random() * game.camera.width), Math.round(Math.random() * game.camera.height));
  },

  update: function() {
  	player.move();
  }
};
