var Player = function(x, y, facing, id, color) {
	this.x = x;
	this.y = y;
	this.facing = facing;
	this.id = id;
	this.color = color;
	
	this.alive = true;

	this.bombStrength = 4;
}

module.exports = Player;