var Bomb = function(x, y, explosionTimerId) {
	this.x = x;
	this.y = y;
	this.explosionTimerId = explosionTimerId;
};

Bomb.prototype = {
	detonate: function(map, strength, players) {
		var explosionData = {};
		explosionData.explosions = [];
		explosionData.killedPlayers = [];
		explosionData.destroyedBlocks = [];

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
			var distanceBetweenCenters = 40;

			if(this.generateIndividualExplosion(x + xCoefficient * (i * distanceBetweenCenters + 35),
				y + yCoefficient * (i * distanceBetweenCenters + 35), xCoefficient, yCoefficient,
				middleKey, explosionData, map, players, endKey) == false) {
				return;
			}
		}

		this.generateIndividualExplosion(x + xCoefficient * (((strength - 1) * 40) + 35), y + yCoefficient * (((strength - 1) * 40) + 35),
		xCoefficient, yCoefficient, endKey, explosionData, map, players);
	},

	generateIndividualExplosion: function(x, y, xCoefficient, yCoefficient, key, explosionData, map, players, destroyBlockKey) {
		var hitData = map.hitTest(x + 20 * xCoefficient, y + 20 * yCoefficient);

		if(hitData.hitBlock == 2) {
			var randomItem = map.destroyTile(hitData.row, hitData.col);
			explosionData.destroyedBlocks.push({row: hitData.row, col: hitData.col, itemId: randomItem});
			if(destroyBlockKey) {
				key = destroyBlockKey;
			}
		}

		explosionData.explosions.push({x: x, y: y, key: key, hide: hitData.hitBlock == 1});

		for(var i in players) {
			var player = players[i];
			if(!player.alive) {
				continue;
			}
			if(Math.floor((player.x - 6.5)/ TILE_SIZE) == Math.floor(x / TILE_SIZE)  && Math.floor((player.y + 7)/ TILE_SIZE) == Math.floor(y / TILE_SIZE)) {
				explosionData.killedPlayers.push(player.id);
			}
		}

		return hitData.hitBlock != 1 && hitData.hitBlock != 2;
	}
}

module.exports = Bomb;