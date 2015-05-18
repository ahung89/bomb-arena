var TextConfigurer = require("../util/text_configurer");

var Preloader = function () {};

module.exports = Preloader;

Preloader.prototype = {

  displayLoader: function() {
    this.text = game.add.text(game.camera.width / 2, 250, "Loading... ");
    this.text.anchor.setTo(.5, .5);
    TextConfigurer.configureText(this.text, "white", 32);

    this.load.onFileComplete.add(function(progress) {
        this.text.setText("Loading... " + progress + "%");
    }, this);

    this.load.onLoadComplete.add(function() {
        game.state.start("TitleScreen");
    });
  },

  preload: function () {
    this.displayLoader();

    this.load.spritesheet("bomberman_white", "assets/sprites/bomberman.png", 28, 50);
    this.load.spritesheet("bomberman_black", "assets/sprites/bomberman_black.png", 28, 50);
    this.load.spritesheet("bomberman_blue", "assets/sprites/bomberman_blue.png", 28, 50);
    this.load.spritesheet("bomberman_red", "assets/sprites/bomberman_red.png", 28, 50);
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

    this.load.tilemap("levelOne", "assets/levels/level_one_blocks.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap("levelTwo", "assets/levels/level_two.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.image("tiles", "assets/tiles/tileset.png");
    this.load.image("select_stage", "assets/sprites/lobby/select_stage.png");
    this.load.image("limitless_brook_thumbnail", "assets/levels/thumbnails/limitless_brook_thumbnail.png");
    this.load.image("danger_desert_thumbnail", "assets/levels/thumbnails/danger_desert_thumbnail.png");
    this.load.image("pending_game_backdrop", "assets/sprites/lobby/backdrop.png");
    this.load.image("round_end_display", "assets/sprites/lobby/end_of_round_window.png");
    this.load.image("repeating_bombs", "assets/sprites/lobby/repeating_bombs.png");
    this.load.image("lobby_backdrop", "assets/sprites/lobby/lobby_backdrop.png");
    this.load.image("bomberman_head_white", "assets/sprites/lobby/bomberman_head.png");
    this.load.image("bomberman_head_blue", "assets/sprites/lobby/bomberman_head_blue.png");
    this.load.image("bomberman_head_green", "assets/sprites/lobby/bomberman_head_green.png");
    this.load.image("bomberman_head_purple", "assets/sprites/lobby/bomberman_head_purple.png");
    this.load.image("bomberman_head_red", "assets/sprites/lobby/bomberman_head_red.png");
    this.load.image("bomberman_head_black", "assets/sprites/lobby/bomberman_head_black.png");
    this.load.image("bomb_count_powerup", "assets/sprites/bomb_count_powerup.png");
    this.load.image("bomb_strength_powerup", "assets/sprites/bomb_strength_powerup.png");
    this.load.image("speed_powerup", "assets/sprites/speed_powerup.png");
    this.load.image("bomb_count_notification", "assets/sprites/bomb_count_notification.png");
    this.load.image("bomb_strength_notification", "assets/sprites/bomb_strength_notification.png");
    this.load.image("speed_notification", "assets/sprites/speed_notification.png");
    this.load.image("round_1", "assets/sprites/lobby/round_1.png");
    this.load.image("round_2", "assets/sprites/lobby/round_2.png");
    this.load.image("final_round", "assets/sprites/lobby/final_round.png");
    this.load.image("tiebreaker", "assets/sprites/lobby/tiebreaker.png");

    // For title screen
    this.load.image("titlescreen_bg", "assets/titlescreen/background.png");
    this.load.image("titlescreen_title", "assets/titlescreen/title.png");
    this.load.image("howto", "assets/titlescreen/howtoplay.png");
    this.load.image("cloud1", "assets/titlescreen/cloud1.png");
    this.load.image("cloud2", "assets/titlescreen/cloud2.png");
    this.load.image("cloud3", "assets/titlescreen/cloud3.png");
    this.load.image("cloud4", "assets/titlescreen/cloud4.png");
    this.load.image("cloud5", "assets/titlescreen/cloud5.png");
    this.load.image("cloud6", "assets/titlescreen/cloud6.png");
    this.load.image("cloud7", "assets/titlescreen/cloud7.png");
    this.load.spritesheet("titlescreen_start", "assets/titlescreen/startbutton.png", 197, 52);
    this.load.spritesheet("titlescreen_howto", "assets/titlescreen/howtobutton.png", 197, 52);
    this.load.spritesheet("titlescreen_bomberman", "assets/titlescreen/bomberman.png", 270, 240);

    this.load.audio("explosion", "assets/sounds/bomb.ogg");
    this.load.audio("powerup", "assets/sounds/powerup.ogg");
  }
};
