var util = require('util');

var Bomb = function(x, y, id) {
	this.x = x;
	this.y = y;
	this.id = id;
};

Bomb.prototype = {
	detonate: function(map, strength) {
		var explosions = [];

		//Add center explosion.
		explosions.push({x: this.x, y: this.y, key: "explosion_center"});

		this.generateExplosionInDirection(this.x, this.y, 1, 0, strength, "explosion_horizontal", "explosion_right", explosions, map);
   		this.generateExplosionInDirection(this.x, this.y, -1, 0, strength, "explosion_horizontal", "explosion_left", explosions, map);
   		this.generateExplosionInDirection(this.x, this.y, 0, 1, strength, "explosion_vertical", "explosion_bottom", explosions, map);
   		this.generateExplosionInDirection(this.x, this.y, 0, -1, strength, "explosion_vertical", "explosion_top", explosions, map);

   		return explosions;
	},

	generateExplosionInDirection: function(x, y, xCoefficient, yCoefficient, strength, middleKey, endKey, explosions, map) {
		for(var i = 0; i < strength - 1; i++) {
			var distanceBetweenCenters = i == 0 ? 35 : 40;

			if(this.generateIndividualExplosion(x + xCoefficient * ((i + 1) * distanceBetweenCenters),
				y + yCoefficient * ((i + 1) * distanceBetweenCenters), xCoefficient, yCoefficient, middleKey, explosions, map) == false) {
				return;
			}
		}

		this.generateIndividualExplosion(x + xCoefficient * (((strength - 1) * 40) + 35), y + yCoefficient * (((strength - 1) * 40) + 35),
		xCoefficient, yCoefficient, endKey, explosions, map);
	},

	generateIndividualExplosion: function(x, y, xCoefficient, yCoefficient, key, explosions, map) {
		var hitBlock = map.hitTest(x + 20 * xCoefficient, y + 20 * yCoefficient);
		var hide = hitBlock != null;

		explosions.push({x: x, y: y, key: key, hide: hide});

		if(hitBlock) {
			return false;
		}
	}
}

module.exports = Bomb;