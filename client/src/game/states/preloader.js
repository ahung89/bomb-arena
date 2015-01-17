var Preloader = function () {};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    this.load.spritesheet("bomberman", "assets/sprites/bomberman.png", 28, 50);
    this.load.spritesheet("bomb", "assets/sprites/bomb.png", 26, 40);
  },

  create: function () {
    game.state.start('Level');
  }
};
