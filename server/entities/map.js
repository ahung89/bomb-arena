var Map = function(data, tileSize) {
	// initialize map by parsing the tilemap data from the client into a 2d array.
	this.mapData = [];
	this.tileSize = tileSize;

	var tiles = data.tiles;
	var i = 0;

	for(var row = 0; row < data.height; row++) {
		this.mapData.push([]);
		for(var col = 0; col < data.width; col++) {
			this.mapData[row][col] = tiles[i] == 0 ? 0 : 1;
			i++;
		}
	}
};

Map.prototype = {
	// Check if coordinates lay within a block. If so, return the bounds of that block. If not, return null;
	hitTest: function(x, y) {
		var row = Math.floor(y / this.tileSize), col = Math.floor(x / this.tileSize);
		if(this.mapData[row] && this.mapData[row][col] == 1) {
			return {
				left: col * this.tileSize,
				right: (col + 1) * this.tileSize,
				top: row * this.tileSize,
				bottom: (row + 1) * this.tileSize
			};
		} else {
			return null;
		}
	},

	findNearestTileCenter: function(x, y) {
		var col = Math.floor(x / this.tileSize), row = Math.floor(y / this.tileSize);
		return {x: col * this.tileSize + this.tileSize / 2, y: row * this.tileSize + this.tileSize / 2};
	}
};

module.exports = Map;