var util = require('util');

var Bomb = function(x, y, id) {
	this.x = x;
	this.y = y;
	this.id = id;
};

Bomb.prototype = {
	detonate: function(map, strength, players) {
		var explosionData = {};
		explosionData.explosions = [];
		explosionData.killedPlayers = [];

		// Add center explosion.
		this.generateIndividualExplosion(this.x, this.y, 0, 0, "explosion_center", explosionData, map, players);

		// Add explosions in all four directions.
		this.generateExplosionInDirection(this.x, this.y, 1, 0, strength, "explosion_horizontal", "explosion_right",
		 explosionData, map, players);
   		this.generateExplosionInDirection(this.x, this.y, -1, 0, strength, "explosion_horizontal", "explosion_left",
   		 explosionData, map, players);
   		this.generateExplosionInDirection(this.x, this.y, 0, 1, strength, "explosion_vertical", "explosion_bottom",
   		 explosionData, map, players);
   		this.generateExplosionInDirection(this.x, this.y, 0, -1, strength, "explosion_vertical", "explosion_top",
   		 explosionData, map, players);

   		return explosionData;
	},

	generateExplosionInDirection: function(x, y, xCoefficient, yCoefficient, strength, middleKey, endKey, explosionData, map, players) {
		for(var i = 0; i < strength - 1; i++) {
			var distanceBetweenCenters = i == 0 ? 35 : 40;

			if(this.generateIndividualExplosion(x + xCoefficient * ((i + 1) * distanceBetweenCenters),
				y + yCoefficient * ((i + 1) * distanceBetweenCenters), xCoefficient, yCoefficient,
				middleKey, explosionData, map, players) == false) {
				return;
			}
		}

		this.generateIndividualExplosion(x + xCoefficient * (((strength - 1) * 40) + 35), y + yCoefficient * (((strength - 1) * 40) + 35),
		xCoefficient, yCoefficient, endKey, explosionData, map, players);
	},

	generateIndividualExplosion: function(x, y, xCoefficient, yCoefficient, key, explosionData, map, players) {
		var hitBlock = map.hitTest(x + 20 * xCoefficient, y + 20 * yCoefficient);
		var hide = hitBlock != null;

		explosionData.explosions.push({x: x, y: y, key: key, hide: hide});

		for(var i in players) {
			var player = players[i];
			if(Math.floor((player.x - 6.5)/ TILE_SIZE) == Math.floor(x / TILE_SIZE)  && Math.floor((player.y + 7)/ TILE_SIZE) == Math.floor(y / TILE_SIZE) ) {
				explosionData.killedPlayers.push(player.id);
			}
		}

		if(hitBlock) {
			return false;
		}
	}
}

module.exports = Bomb;