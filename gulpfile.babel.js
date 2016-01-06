'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import autoprefixer from 'autoprefixer';
import colorguard from 'colorguard';
import reporter from 'postcss-reporter';

// Auto load Gulp plugins
const $ = gulpLoadPlugins({
  rename: {'gulp-util': 'gutil'}
});

// Constants
const dirs = {
  src: 'src/',
  dest: 'hugo/static/'
};

const sassPaths = {
  src: dirs.src+'sass/main.scss',
  dest: dirs.dest+'styles/'
};

const hugoPaths = {
  StageBaseUrl: "http://stage.example.com/",
  LiveBaseUrl: "http://example.com/",
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
  return gulp.src(sassPaths.dest+'main.css')
    .pipe($.minifyCss())
    .pipe($.rename({extname: '.min.css'}))
    .pipe(gulp.dest(sassPaths.dest));
});


// Javascript processing and minification
gulp.task('scripts', () => {
  return gulp.src(dirs.src+'scripts/*.js')
    .pipe($.uglify())
    .pipe($.rename({extname: '.min.js'}))
    .pipe(gulp.dest(dirs.dest+'scripts/'));
});


// Image processing (with gm/im)

// Image optimisation


// Hugo
// -D is buildDrafts
// -F is buildFuture
function hugo(status) {

  let exec = require('child_process').execSync;
  let cmd = 'hugo --config=hugo/config.toml -s hugo/';
  if (status == 'stage') {
      cmd += ' -D -d published/stage/ --baseURL="' + hugoPaths.StageBaseUrl + '"';
      $.gutil.log('hugo command: \n' + cmd);
  }
  else if (status == 'live') {
      cmd += ' -d published/live/ --baseURL="' + hugoPaths.LiveBaseUrl + '"';
      $.gutil.log('hugo command: \n' + cmd);
  }
  else {
      cmd += ' -DF -d published/dev/';
      $.gutil.log('hugo command: \n' + cmd);
  }

  let result = exec(cmd, {encoding: 'utf-8'});
  $.gutil.log('hugo reports: \n' + result);

}

gulp.task('hugoDev', () => {
  return Promise.all([ hugo() ])
});

gulp.task('hugoStage',  () => {
  return Promise.all([ hugo('stage') ])
});

gulp.task('hugoLive', () => {
  return Promise.all([ hugo('live') ])
});


// HTML Linting
// HTML minification?
// Will need to run hugo first, then check output?


// Testing


// Cleaning

// Specific cleaning tasks for dev/stage/live of hugo/published.
gulp.task('clean:dev', () => {
  return Promise.all([ del('hugo/published/dev/') ])
});
gulp.task('clean:stage', () => {
  return Promise.all([ del('hugo/published/stage/') ])
});
gulp.task('clean:live', () => {
  return Promise.all([ del('hugo/published/live/') ])
});

// Watch for changes
// browsersync too

// Build (staging and prod)?
// Is this really needed

// serve/watch (dev)
// needs to spawn a hugo watch task too (and pass back hugo errors)


// Tasks
gulp.task('default', gulp.parallel('styles','scripts'));
gulp.task('dev', gulp.series('clean:dev','styles','scripts','hugoDev'));
gulp.task('stage', gulp.series('clean:stage', gulp.parallel('styles','scripts'),'minstyles','hugoStage'));
gulp.task('live', gulp.series('clean:live', gulp.parallel('styles','scripts'),'minstyles','hugoLive'));

