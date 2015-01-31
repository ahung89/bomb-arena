var Map = function(data) {
	// initialize map by parsing the tilemap data from the client into a 2d array.
	this.mapData = [];
	var tiles = data.tiles;
	var i = 0;

	for(var row = 0; row < data.height; row++) {
		this.mapData.push([]);
		for(var col = 0; col < data.width; col++) {
			this.mapData[row][col] = tiles[i] == 0 ? 0 : 1;
			i++;
		}
	}

}

module.exports = Map;