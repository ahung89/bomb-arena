var Bomb = function(x, y, id) {
	Phaser.Sprite.call(this, game, x, y, "bomb");
	this.id = id;

	this.anchor.setTo(.5, .5);
	game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
	game.add.existing(this);
}

Bomb.prototype = Object.create(Phaser.Sprite.prototype);

Bomb.renderExplosion = function(explosions) {
	explosions.forEach(function(explosion) {
      var explosionSprite = new Phaser.Sprite(game, explosion.x, explosion.y, explosion.key, 0);
      explosionSprite.anchor.setTo(.5, .5);
      explosionSprite.animations.add("explode");
      explosionSprite.animations.getAnimation("explode").onComplete.add(function() {
       level.deadGroup.push(this);
      }, explosionSprite);

      if(explosion.hide) {
        game.world.addAt(explosionSprite, 1);
      } else {
        game.world.add(explosionSprite);
      }

      explosionSprite.play("explode", 17, false);
    });
}

module.exports = Bomb;