var bombSound;
var powerupSound;

module.exports = {
	initialize: function() {
		bombSound = game.add.audio("explosion");
		powerupSound = game.add.audio("powerup");
	},

	playBombSound: function() {
		bombSound.play();
	},

	playPowerupSound: function() {
		powerupSound.play();
	}
}