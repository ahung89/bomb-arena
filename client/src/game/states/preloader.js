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
    this.load.spritesheet("left_select_button", "assets/sprites/lobby/left_select_button.png", 60, 60);
    this.load.spritesheet("right_select_button", "assets/sprites/lobby/right_select_button.png", 60, 60);
    this.load.spritesheet("ok_button", "assets/sprites/lobby/ok_button.png", 60, 60);
    this.load.spritesheet("character_square", "assets/sprites/lobby/character_square.png", 89, 89);
    this.load.spritesheet("start_game_button", "assets/sprites/lobby/start_game_button.png", 202, 43);
    this.load.spritesheet("leave_game_button", "assets/sprites/lobby/leave_game_button.png", 202, 43);
    this.load.spritesheet("game_slot", "assets/sprites/lobby/game_slot.png", 522, 48);

    this.load.tilemap("levelOne", 'assets/levels/level_one.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image("tiles", "assets/tiles/tileset.png");
    this.load.image("select_stage", "assets/sprites/lobby/select_stage.png");
    this.load.image("limitless_brook_thumbnail", "assets/levels/thumbnails/limitless_brook_thumbnail.png");
    this.load.image("pending_game_backdrop", "assets/sprites/lobby/backdrop.png");
    this.load.image("repeating_bombs", "assets/sprites/lobby/repeating_bombs.png");
    this.load.image("lobby_backdrop", "assets/sprites/lobby/lobby_backdrop.png");
    this.load.image("bomberman_head_white", "assets/sprites/lobby/bomberman_head.png");
    this.load.image("bomberman_head_blue", "assets/sprites/lobby/bomberman_head_blue.png");
    this.load.image("bomberman_head_green", "assets/sprites/lobby/bomberman_head_green.png");
    this.load.image("bomberman_head_purple", "assets/sprites/lobby/bomberman_head_purple.png");
    this.load.image("bomberman_head_red", "assets/sprites/lobby/bomberman_head_red.png");
    this.load.image("bomberman_head_black", "assets/sprites/lobby/bomberman_head_black.png");

    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  },

  create: function () {
    game.state.start("Lobby");
  }
};
