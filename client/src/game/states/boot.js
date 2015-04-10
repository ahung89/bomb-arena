var AudioPlayer = require("../util/audio_player");

var Boot = function () {};

module.exports = Boot;

Boot.prototype = {

  preload: function () {
    // Fill in later.
  },

  create: function () {
    game.stage.disableVisibilityChange = true; // So that game doesn't stop when window loses focus.
    game.input.maxPointers = 1;
    AudioPlayer.initialize();

    if (game.device.desktop) {
      game.stage.scale.pageAlignHorizontally = true;
    } else {
      game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
      game.stage.scale.minWidth =  480;
      game.stage.scale.minHeight = 260;
      game.stage.scale.maxWidth = 640;
      game.stage.scale.maxHeight = 480;
      game.stage.scale.forceLandscape = true;
      game.stage.scale.pageAlignHorizontally = true;
      game.stage.scale.setScreenSize(true);
    }

    game.state.start('Preloader');
  }
};
