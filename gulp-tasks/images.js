//
// Process images
// before use install vips then gulp-sharp
// for vips see: https://www.npmjs.com/package/gulp-sharp
// then: npm install gulp-sharp --save-dev

// Move this to external config
let sharpOptions = {
  resize : [1280, 800],
  max : true,
  withoutEnlargement: true,
  quality : 80,
  progressive : false
};


module.exports = function (gulp, plugins) {
  return function () {
    gulp.src('src/img_raw/')
    .pipe(plugins.sharp(sharpOptions))
    .pipe(gulp.dest('src/img_processed/'));
  };
};
