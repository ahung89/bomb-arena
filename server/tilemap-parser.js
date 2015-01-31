exports.parse = function(tilemap) {
	var parsedMap = [];
	var tiles = tilemap.tiles;
	var i = 0;

	for(var row = 0; row < tilemap.height; row++) {
		parsedMap.push([]);
		for(var col = 0; col < tilemap.width; col++) {
			parsedMap[row][col] = tiles[i] == 0 ? 0 : 1;
			i++;
		}
	}

	return parsedMap;
}