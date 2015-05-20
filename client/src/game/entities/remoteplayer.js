var remotePlayerUpdateInterval = 100;
var TextureUtil = require("../util/texture_util");

function getFrame(color, number) {
  return "gamesprites/bomberman_" + color + "/bomberman_" + color + "_" + number + ".png";
}

var RemotePlayer = function(x, y, id, color) {
	this.id = id;
	this.previousPosition = {x: x, y: y};
	this.lastMoveTime = 0;
	this.targetPosition;
  this.spawnPoint = {x: x, y: y};
  this.firstFrame = this.getFrame(color, "01");

	Phaser.Sprite.call(this, game, x, y, TEXTURES, this.firstFrame);

	game.physics.enable(this, Phaser.Physics.ARCADE);

	this.anchor.setTo(.5, .5);

  this.animations.add("down", TextureUtil.getFrames(this.getFrame, color, ["01", "02", "03", "04", "05"]), 10, true);
  this.animations.add("up", TextureUtil.getFrames(this.getFrame, color, ["06", "07", "08", "09", "10"]), 10, true);
  this.animations.add("right", TextureUtil.getFrames(this.getFrame, color, ["11", "12", "13"]), 10, true);
  this.animations.add("left", TextureUtil.getFrames(this.getFrame, color, ["14", "15", "16"]), 10, true);

	game.add.existing(this);
};

RemotePlayer.prototype = Object.create(Phaser.Sprite.prototype);

RemotePlayer.prototype.interpolate = function(lastFrameTime) {
	if(this.distanceToCover && lastFrameTime) {
		if((this.distanceCovered.x < Math.abs(this.distanceToCover.x) || this.distanceCovered.y < Math.abs(this.distanceToCover.y))) {
          var fractionOfTimeStep = (game.time.now - lastFrameTime) / remotePlayerUpdateInterval;
          var distanceCoveredThisFrameX = fractionOfTimeStep * this.distanceToCover.x;
          var distanceCoveredThisFrameY = fractionOfTimeStep * this.distanceToCover.y;

          this.distanceCovered.x += Math.abs(distanceCoveredThisFrameX);
          this.distanceCovered.y += Math.abs(distanceCoveredThisFrameY);

          this.position.x += distanceCoveredThisFrameX;
          this.position.y += distanceCoveredThisFrameY;
        } else {
          this.position.x = this.targetPosition.x;
          this.position.y = this.targetPosition.y;
        }
    }
}

RemotePlayer.prototype.getFrame = function (color, number) {
  return "gamesprites/bomberman_" + color + "/bomberman_" + color + "_" + number + ".png";
}

RemotePlayer.prototype.reset = function() {
  this.x = this.spawnPoint.x;
  this.y = this.spawnPoint.y;
  this.frame = this.firstFrame;
  this.previousPosition = {x: this.x, y: this.y};
  this.distanceToCover = null;
  this.distanceCovered = null;
  this.targetPosition = null
  this.lastMoveTime = null;
  
  if(!this.alive) {
    this.revive();
  }
};

module.exports = RemotePlayer;