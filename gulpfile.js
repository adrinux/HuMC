'use strict';

const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const del = require('del');
const browserSync = require('browser-sync').create();
const rsync = require('rsyncwrapper');
//const git = require('gulp-git');
const gm = require('gulp-gm');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const responsive = require('gulp-responsive');


// Import task configuration
var config = require('./config/config.js');


// Image processing via gulp-gm
function imgMagic() {
  return gulp.src('src/img_raw/*.{jpg,png}')
    .pipe(gm( function (gmfile) {
      return gmfile
        .resize(1360, 1024);
    }))
    .pipe(gulp.dest('src/img_tmp/'));
}


// Responsive Images
// Generate diiferent sized images for srcset
function imgResponsive() {
  return gulp.src('src/img_tmp/**/*.{jpg,png}')
    .pipe(responsive(config.responsiveOptions, config.responsiveGlobals))
    .pipe(gulp.dest('src/img_responsive/'));
}


// Optimize responsive images and copy to final location
function imgOptim () {
  return gulp.src('src/img_responsive/**/*.{jpg,png}')
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 5 }),
      imageminMozjpeg({ quality: 90 })
    ],{verbose: true}))
    .pipe(gulp.dest('hugo/static/images/'));
}


// Optimize and copy svg or gif images to final destination
function imgMin () {
  return gulp.src('src/img_raw/**/*.{svg,gif}')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false }
        ]
      })
    ],{verbose: true}))
    .pipe(gulp.dest('hugo/static/images/'));
}


// Modernizr
// Read custom config and generate a custom build , already minified
gulp.task('custoModernizr', () => {
  let exec = require('child_process').exec;
  let cmd = './node_modules/.bin/modernizr ';
  cmd += '-c ./config/modernizr-config.json ';
  cmd += '-d ./hugo/static/scripts_vendor/modernizr.custom.js';
  return exec(cmd, {encoding: 'utf-8'});
});


// Hugo
// -D is buildDrafts
// -F is buildFuture
function hugo (status) {
  let exec = require('child_process').execSync;
  let cmd = 'hugo --config=hugo/config.toml -s hugo/';
  if (status === 'stage') {
    cmd += ' --minify' + ' - D - d published / stage / --baseURL = "' + config.hugoBaseUrl.stage + '"';
    gulpUtil.log('hugo command: \n' + cmd);
  } else if (status === 'live') {
    cmd += ' --minify' + ' -d published/live/ --baseURL="' + config.hugoBaseUrl.live + '"';
    gulpUtil.log('hugo command: \n' + cmd);
  } else {
    cmd += ' -DF -d published/dev/';
    gulpUtil.log('hugo command: \n' + cmd);
  }

  let result = exec(cmd, {encoding: 'utf-8'});
  gulpUtil.log('hugo reports: \n' + result);
}

gulp.task('hugoDev', () => {
  return Promise.all([ hugo() ]);
});

gulp.task('hugoStage', () => {
  return Promise.all([ hugo('stage') ]);
});

gulp.task('hugoLive', () => {
  return Promise.all([ hugo('live') ]);
});


// Cleaning
// Specific cleaning functions for dev/stage/live of hugo/published.
function cleanDev (done) {
  return del(['hugo/published/dev/'], done);
}
function cleanStage (done) {
  return del(['hugo/published/stage/'], done);
}
function cleanLive (done) {
  return del(['hugo/published/live/'], done);
}

// Clean temporary image files created during processing
function cleanImages (done) {
  return del([
    'src/img_tmp/**/*',
    'hugo/static/images/*',
    'src/img_responsive/*',
    'hugo/static/images/responsive/*'
  ], done);
}

// Clean only responsive image derivatives
function cleanResponsive (done) {
  return del([
    'src/img_responsive/*',
    'hugo/static/images/responsive/*'
  ], done);
}


// Serve and sync

// Wrap browsersync reload
// This wrapper seems to be required to get around a bug, see recent comments on
// this issue https://github.com/BrowserSync/browser-sync/issues/711
function reload(done) {
  // return browserSync.reload(); switched to callback because some tasks don't
  // signal completion to gulp, example issues
  // https://github.com/BrowserSync/browser-sync/pull/987
  // https://github.com/BrowserSync/browser-sync/issues/1065
  browserSync.reload();
  done();
}

// Watch files and serve with Browsersync
gulp.task('watcher', (done) => {

  // Start a server
  browserSync.init({
    server: {
      baseDir: 'hugo/published/dev'
    }
  }, done());

  // Watch files for changes
  gulp.watch('src/img_tmp').on('change', gulp.series(imgResponsive, imgOptim, imgMin, 'hugoDev', reload));
  gulp.watch('config/modernizr-config.json').on('change', gulp.series('custoModernizr', 'hugoDev', reload));
  gulp.watch(['hugo/archetypes/*', 'hugo/content/', 'hugo/data/', 'hugo/config.*']).on('change', gulp.series('hugoDev', reload));
});


// Deploy

// Deploy to staging via rsync
gulp.task('upstage', () => {
  return Promise.all([
    rsync(config.stageRsyncOptions, function(error, stdout, stderr, cmd) {
      gulpUtil.log('Running: ' + cmd);
      gulpUtil.log(stdout);
    })
  ]);
});

// Deploy to live via rsync
gulp.task('golive', () => {
  return Promise.all([
    rsync(config.liveRsyncOptions, function(error, stdout, stderr, cmd) {
      gulpUtil.log('Running: ' + cmd);
      gulpUtil.log(stdout);
    })
  ]);
});



// 'gulp' is the main development task, essentially dev + watch + browsersync
gulp.task('default',
  gulp.series(
    'cleanDev',
    'custoModernizr',
    'hugoDev',
    'watcher'
  )
);
// 'gulp dev' a single run, hugo will generate pages for drafts and future posts
gulp.task('dev',
  gulp.series(
    'cleanDev',
    'custoModernizr',
    'hugoDev'
  )
);
// 'gulp stage' a single run, hugo will generate pages for drafts
gulp.task('stage',
  gulp.series(
    'cleanStage',
    'custoModernizr',
    'hugoStage'
  )
);
// 'gulp live' a single run, production only
gulp.task('live',
  gulp.series(
    'cleanLive',
    'custoModernizr',
    'hugoLive'
  )
);

// Clean and regenerate all images
gulp.task('reprocess', gulp.series(cleanImages, imgMagic, imgResponsive, imgOptim, imgMin));
// Clean and regenerate responsive images (use after modifying responsive config)
gulp.task('reprocess:responsive', gulp.series(cleanResponsive, imgResponsive, imgOptim));


// Task used for debugging function based task or tasks
gulp.task('dt', gulp.series('copy'));
