var Preloader = function () {};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    this.load.spritesheet("bomberman", "assets/sprites/bomberman.png", 28, 50);
    this.load.spritesheet("bomb", "assets/sprites/bomb.png", 26, 40);

    this.load.tilemap("levelOne", 'assets/levels/levelOne.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image("tiles", "assets/tiles/tileset.png");
  },

  create: function () {
    game.state.start("Level");
  }
};
