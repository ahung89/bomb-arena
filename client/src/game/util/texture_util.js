module.exports = {
	getFrames: function (getFrameFunction, prefix, numbers) {
  		var frames = [];
  		numbers.forEach(function(number) {
  		  frames.push(getFrameFunction(prefix, number));
  		});
  		return frames;
	}
}