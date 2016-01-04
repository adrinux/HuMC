'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import autoprefixer from 'autoprefixer';
import colorguard from 'colorguard';
import reporter from 'postcss-reporter';

// Auto load Gulp plugins
const $ = gulpLoadPlugins();

// Constants
const dirs = {
  src: 'src',
  dest: 'hugo/static'
};

const sassPaths = {
  src: dirs.src+'/sass/main.scss',
  dest: dirs.dest+'/styles/'
};



// CSS processing, Linting
gulp.task('styles', () => {
  let processors = [
    colorguard({threshold: ['3']}),
    autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
    reporter()
  ];
  return gulp.src(sassPaths.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync().on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(sassPaths.dest));
});

// CSS minification and revision
gulp.task('minstyles', () => {
  return gulp.src('${sassPaths.dest}/main.css')
    .pipe($.minifyCss())
    .pipe($.rename({extname: '.min.css'}))
    .pipe(gulp.dest(sassPaths.dest));
});


// Javascript processing and minification
gulp.task('scripts', () => {
  return gulp.src('${dirs.src}/scripts/*.js')
    .pipe($.uglify())
    .pipe($.rename({extname: '.min.js'}))
    .pipe(gulp.dest('${dirs.dest}/scripts/'));
});


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
gulp.task('default', gulp.series('styles','scripts'));
gulp.task('prod', gulp.series('styles','minstyles','scripts'));

