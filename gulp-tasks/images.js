//
// Process images
module.exports = function (gulp, plugins) {
  return function () {
    gulp.src('src/img_raw/')
    .pipe(plugins.)
    .pipe(gulp.dest('src/img_processed/'));
  };
};


// Decide which software to use...graphicsmagick or sharp
