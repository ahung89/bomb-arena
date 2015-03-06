var Player = function(x, y, facing, id) {
	this.x = x;
	this.y = y;
	this.facing = facing;
	this.id = id;
	this.alive = true;

	this.bombStrength = 4;
}

module.exports = Player;