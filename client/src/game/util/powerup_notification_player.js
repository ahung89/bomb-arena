var PowerupIds = require("../../../../common/powerup_ids");

var notificationImageMap = {};
notificationImageMap[PowerupIds.BOMB_STRENGTH] = "bomb_strength_notification";
notificationImageMap[PowerupIds.BOMB_CAPACITY] = "bomb_count_notification";
notificationImageMap[PowerupIds.SPEED] = "speed_notification";

exports.showPowerupNotification = function(powerupId, playerX, playerY) {
    var notificationImageKey = notificationImageMap[powerupId];
    var image = new Phaser.Image(game, playerX, playerY - 10, notificationImageKey);
    image.anchor.setTo(.5, .5);
    game.add.existing(image);

    var upwardMotionTween = game.add.tween(image);
    upwardMotionTween.to({y: image.y - 30}, 600, Phaser.Easing.Default, true, 0);

    var fadeTween = game.add.tween(image);
    fadeTween.to({alpha: 0}, 600, Phaser.Easing.Default, true, 0);
    
    upwardMotionTween.onComplete.addOnce(function(obj) {
      obj.destroy();
    });
}