var ItemGenerator = require("../util/item_generator");
var PowerupIDs = require("../../common/powerup_ids");

var Map = function(data, tileSize) {
	// initialize map by parsing the tilemap data from the client into a 2d array.
	this.mapData = [];
	this.placedBombs = [];
	this.tileSize = tileSize;

	var tiles = data.tiles;
	var i = 0;

	for(var row = 0; row < data.height; row++) {
		this.mapData.push([]);
		this.placedBombs.push([]);
		for(var col = 0; col < data.width; col++) {
			this.placedBombs[row][col] = 0;
			if(tiles[i] == 0) {
				this.mapData[row][col] = 0;
			} else if(tiles[i] == data.destructibleTileId) {
				this.mapData[row][col] = 2;
			} else {
				this.mapData[row][col] = 1;
			}
			i++;
		}
	}
};

Map.prototype = {
	// Return the type of block that a tile represents.
	hitTest: function(x, y) {
		var row = Math.floor(y / this.tileSize), col = Math.floor(x / this.tileSize);
		return {
			row: row,
			col: col,
			hitBlock: this.mapData[row][col]
		};
	},

	// Returns tile center for bomb's location if successful. Returns -1 if the space is occupied by an existing bomb.
	placeBombOnGrid: function(x, y) {
		var col = Math.floor(x / this.tileSize), row = Math.floor(y / this.tileSize);
		if(this.bombExistsAtLocation(row, col)) {
			return -1;
		}

		this.placedBombs[row][col] = 1;
		return {x: col * this.tileSize + this.tileSize / 2, y: row * this.tileSize + this.tileSize / 2};
	},

	destroyTile: function(row, col) {
		var powerup = ItemGenerator.generateItem();

		this.mapData[row][col] = powerup;

		return powerup;
	},

	bombExistsAtLocation: function(row, col) {
		return this.placedBombs[row][col] == 1;
	},

	claimPowerup: function(x, y) {
		var row = Math.floor(y / this.tileSize), col = Math.floor(x / this.tileSize);
		var hitBlock = this.mapData[row][col];
		if(PowerupIDs.isAPowerup(hitBlock)) {
			console.log("powerup acquired, yo.");
			this.mapData[row][col] = 0;
			return {
				powerupType: hitBlock,
				id: row + "." + col
			};
		} else {
			return null;
		}
	},

	removeBombFromGrid: function(x, y) {
		var col = Math.floor(x / this.tileSize), row = Math.floor(y / this.tileSize);
		this.placedBombs[row][col] = 0;
	}
};

module.exports = Map;