'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';


const dirs = {
  src: 'src',
  dest: 'hugo/static'
};


const sassPaths = {
  src: `${dirs.src}/sass/main.scss`,
  dest: `${dirs.dest}/styles/`
};


gulp.task('styles', () => {
  let processors = [autoprefixer];
  return gulp.src(sassPaths.src)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    //.pipe(autoprefixer())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(sassPaths.dest));
});


gulp.task('default', gulp.series('styles'));
