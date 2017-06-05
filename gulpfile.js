var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	buffer = require('vinyl-buffer'),
	connect = require('gulp-connect'),
	source = require('vinyl-source-stream'),
	jshint = require('gulp-jshint');

gulp.task('default', ['compile']);

paths = {
	entry: './client/src/main.js',
	dist: './client/dist/'
};

gulp.task('compile', function() {
	var bundler = browserify(paths.entry, watchify.args);

	var bundle = function() {
		return bundler
			.bundle()
			.pipe(source('bomb_arena.min.js'))
			.pipe(buffer())
			.pipe(uglify())
			.pipe(connect.reload())
			.pipe(gulp.dest(paths.dist))
	}

	bundler = watchify(bundler);
	bundler.on('update', bundle);

	return bundle();

});
