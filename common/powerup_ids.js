module.exports = {
	BOMB_STRENGTH: 5,

	BOMB_CAPACITY: 6,

	SPEED: 7,

	isAPowerup: function(id) {
		return id === this.BOMB_STRENGTH || id === this.BOMB_CAPACITY || id === this.SPEED;
	}
}