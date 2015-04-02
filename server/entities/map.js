var Map = function(data, tileSize) {
	// initialize map by parsing the tilemap data from the client into a 2d array.
	this.mapData = [];
	this.tileSize = tileSize;

	var tiles = data.tiles;
	var i = 0;

	for(var row = 0; row < data.height; row++) {
		this.mapData.push([]);
		for(var col = 0; col < data.width; col++) {
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
	// Check if coordinates lay within a block. If so, return the bounds of that block. If not, return null;
	hitTest: function(x, y) {
		var row = Math.floor(y / this.tileSize), col = Math.floor(x / this.tileSize);
		return {
			row: row,
			col: col,
			hitBlock: this.mapData[row][col]
		};
	},

	findNearestTileCenter: function(x, y) {
		var col = Math.floor(x / this.tileSize), row = Math.floor(y / this.tileSize);
		return {x: col * this.tileSize + this.tileSize / 2, y: row * this.tileSize + this.tileSize / 2};
	}
};

module.exports = Map;