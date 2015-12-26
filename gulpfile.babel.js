'use strict';

import gulp from 'gulp';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import colorguard from 'colorguard';
import minifyCss from 'gulp-minify-css'
import reporter from 'postcss-reporter';


// Constants
const dirs = {
  src: 'src',
  dest: 'hugo/static'
};

const sassPaths = {
  src: `${dirs.src}/sass/main.scss`,
  dest: `${dirs.dest}/styles/`
};



// CSS processing, Linting
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

// CSS minification and revision
gulp.task('minstyles', () => {
  return gulp.src(sassPaths.dest+'/main.css')
    .pipe(minifyCss())
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest(sassPaths.dest));
});


// Javascript processing and minification



// Image processing (with gm/im)

// Image optimisation


// HTML Linting
// HTML minification?
// Will need to run hugo first, then check output?


// Testing


// Watch for changes
// browsersync too

// Build (staging and prod)

// serve (dev)


// Tasks
gulp.task('default', gulp.series('styles'));
gulp.task('prod', gulp.series('styles','minstyles'));

