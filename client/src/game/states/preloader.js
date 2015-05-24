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

    this.load.atlasJSONHash("bbo_textures", "assets/textures/bbo_textures.png", "assets/textures/bbo_textures.json");

    this.load.tilemap("levelOne", "assets/levels/level_one.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap("levelTwo", "assets/levels/level_two.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.image("tiles", "assets/tiles/tileset.png");
    this.load.image("repeating_bombs", "/assets/repeating_bombs.png");

    this.load.audio("explosion", "assets/sounds/bomb.ogg");
    this.load.audio("powerup", "assets/sounds/powerup.ogg");
    this.load.audio("click", "assets/sounds/click.ogg");

    window.buttonClickSound = new Phaser.Sound(game, "click", .25);
  }
};
