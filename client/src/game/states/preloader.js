var Preloader = function () {};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    // Fill in later.
  },

  create: function () {
    game.state.start('Level');
  }
};
