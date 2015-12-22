'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import colorguard from 'colorguard';
import reporter from 'postcss-reporter';


const dirs = {
  src: 'src',
  dest: 'hugo/static'
};





// CSS processing, Linting
const sassPaths = {
  src: `${dirs.src}/sass/main.scss`,
  dest: `${dirs.dest}/styles/`
};

gulp.task('styles', () => {
  let processors = [
    colorguard({threshold: ['3']}),
    autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
    reporter()
  ];
  return gulp.src(sassPaths.src)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(sassPaths.dest));
});

// CSS minification (only for production)(review when hosting via http2)



// Image processing (with gm/im)

// Image optimisation


// HTML Linting
// HTML minification?


// Watch for changes

// Build (staging and prod)

// serve (dev)


// Tasks
gulp.task('default', gulp.series('styles'));
