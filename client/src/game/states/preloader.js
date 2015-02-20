var Preloader = function () {};

module.exports = Preloader;

WebFontConfig = {
   google: { families: [ "Carter One" ] }
};

Preloader.prototype = {

  preload: function () {
    this.load.spritesheet("bomberman", "assets/sprites/bomberman.png", 28, 50);
    this.load.spritesheet("bomb", "assets/sprites/bomb.png", 26, 40);
    this.load.spritesheet("explosion_top", "assets/sprites/explosion_top.png", 30, 40);
    this.load.spritesheet("explosion_bottom", "assets/sprites/explosion_bottom.png", 30, 40);
    this.load.spritesheet("explosion_left", "assets/sprites/explosion_left.png", 40, 30);
    this.load.spritesheet("explosion_right", "assets/sprites/explosion_right.png", 40, 30);
    this.load.spritesheet("explosion_center", "assets/sprites/explosion_center.png", 30, 30);
    this.load.spritesheet("explosion_horizontal", "assets/sprites/explosion_horizontal.png", 40, 30);
    this.load.spritesheet("explosion_vertical", "assets/sprites/explosion_vertical.png", 30, 40);
    this.load.spritesheet("lobby_slot", "assets/sprites/lobby/lobby_slot.png", 540, 100);
    this.load.spritesheet("join_button", "assets/sprites/lobby/join_button.png", 95, 33);
    this.load.spritesheet("host_button", "assets/sprites/lobby/host_button.png", 95, 33);
    this.load.spritesheet("left_select_button", "assets/sprites/lobby/left_select_button.png", 60, 60);
    this.load.spritesheet("right_select_button", "assets/sprites/lobby/right_select_button.png", 60, 60);
    this.load.spritesheet("ok_button", "assets/sprites/lobby/ok_button.png", 60, 60);

    this.load.tilemap("levelOne", 'assets/levels/level_one.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image("tiles", "assets/tiles/tileset.png");
    this.load.image("select_stage", "assets/sprites/lobby/select_stage.png", 520, 474);
    this.load.image("limitless_brook_thumbnail", "assets/levels/thumbnails/limitless_brook_thumbnail.png", 100, 115);

    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  },

  create: function () {
    game.state.start("StageSelect");
  }
};
