var BLACK_HEX_CODE = "#000000";

module.exports = {
	createFadeTween: function (alphaFrom, alphaTo, fadeDuration) {
		fadeDuration = fadeDuration || 300;

		if(this.fadeGraphic) {
			this.fadeGraphic.destroy();
		}

		this.fadeGraphic = game.add.graphics(0, 0);
		this.fadeGraphic.beginFill(BLACK_HEX_CODE, 1);
		this.fadeGraphic.drawRect(0, 0, game.camera.width, game.camera.height);
		this.fadeGraphic.fixedToCamera = true;

		this.fadeGraphic.alpha = alphaFrom;
		this.fadeGraphic.endFill();

		var tween = game.add.tween(this.fadeGraphic);
		tween.to({alpha: alphaTo}, fadeDuration, Phaser.Easing.Default);
		return tween;
	},

	createFadeInTween: function(fadeDuration) {
		return this.createFadeTween(1, 0, fadeDuration);
	},

	createFadeOutTween: function(fadeDuration) {
		return this.createFadeTween(0, 1, fadeDuration);
	},

	fadeOut: function(callback, callbackContext, fadeDuration) {
		callbackContext = callbackContext ? callbackContext : this;

		var fadeOutTween = this.createFadeOutTween(fadeDuration);
		
		if(typeof callback === 'function') {
			fadeOutTween.onComplete.add(callback, callbackContext);
		}

		fadeOutTween.start();
	},

	fadeIn: function(callback, callbackContext, fadeDuration) {
		callbackContext = callbackContext ? callbackContext : this;

		var fadeInTween = this.createFadeInTween(fadeDuration);

		if(typeof callback === 'function') {
			fadeInTween.onComplete.add(callback, this);
		}

		fadeInTween.start();
	}
}