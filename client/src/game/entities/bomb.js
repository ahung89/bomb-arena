var AudioPlayer = require("../util/audio_player");
var TextureUtil = require("../util/texture_util");

function getFrame(prefix, number) {
  return "gamesprites/" + prefix + "/" + prefix + "_" + number + ".png";
}

var Bomb = function(x, y, id) {
	Phaser.Sprite.call(this, game, x, y, TEXTURES, "gamesprites/bomb/bomb_01.png");
	this.id = id;

	this.anchor.setTo(.5, .5);
	game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
	game.add.existing(this);

  this.sizeTween = game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 500, Phaser.Easing.Default, true, 0, true, true);
}

Bomb.prototype = Object.create(Phaser.Sprite.prototype);

Bomb.prototype.remove = function() {
  this.destroy();
  this.sizeTween.stop(); // stop tween and mark it for deletion
};

Bomb.renderExplosion = function(explosions) {
	explosions.forEach(function(explosion) {
      var explosionSprite = new Phaser.Sprite(game, explosion.x, explosion.y, TEXTURES, getFrame(explosion.key, "01"));
      explosionSprite.anchor.setTo(.5, .5);
      explosionSprite.animations.add("explode", TextureUtil.getFrames(getFrame, explosion.key, ["02", "03", "04", "05"]));
      explosionSprite.animations.getAnimation("explode").onComplete.add(function() {
       level.deadGroup.push(this);
      }, explosionSprite);

      if(explosion.hide) {
        game.world.addAt(explosionSprite, 1);
      } else {
        game.world.add(explosionSprite);
      }

      explosionSprite.play("explode", 17, false);
      AudioPlayer.playBombSound();
    });
}

module.exports = Bomb;