'use strict';

require('babel-polyfill');
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var del = require('del');
var lazypipe = require('lazypipe');
var browserSync = require('browser-sync').create();
var rsync = require('rsyncwrapper');
var sseries = require('stream-series');


// Auto load Gulp plugins
const plugins = gulpLoadPlugins({
  rename: {
    'gulp-util': 'gulpUtil',
    'gulp-inject': 'inject',
    'gulp-htmlmin': 'htmlmin',
    'gulp-htmltidy': 'htmltidy',
    'gulp-gm': 'gm',
    'gulp-imageoptim': 'imageOptim'
  }
});

//
// Import task configuration
var config = require('./config/config.js');


//
// Image processing via gulp-gm
function imgMagic() {
  return gulp.src('src/img_raw/*.{jpg,png}')
    .pipe(plugins.gm( function (gmfile) {
      return gmfile
        .resize(1280, 1024);
    }))
    //.pipe(plugins.rename(config.magicRename))
    .pipe(gulp.dest('src/img_tmp/'));
}

//
// Responsive Images
// Generate diiferent sized images for srcset
function imgResponsive() {
  return gulp.src('src/img_tmp/**/*.{jpg,png}')
    .pipe(plugins.responsive(config.responsiveOptions, config.responsiveGlobals))
    .pipe(gulp.dest('src/img_responsive/'));
}

//
// Optimize responsive images and copy to final location
function imgOptim () {
  return gulp.src('src/img_responsive/**/*.{jpg,png}')
    .pipe(plugins.imageOptim.optimize(config.imageoptimOptions))
    .pipe(gulp.dest('hugo/static/images/'));
}

//
// Optimize and copy svg or gif images to final destination
function imgMin () {
  return gulp.src('src/img_raw/**/*.{svg,gif}')
    .pipe(plugins.imagemin(config.imageminOptions))
    .pipe(gulp.dest('hugo/static/images/'));
}


//
// CSS processing
function postCss () {
  return gulp.src('src/styles/*.{css,pcss}')
    .pipe(plugins.postcss(config.processors))
    .pipe(plugins.rename({extname: '.css'}))
    .pipe(gulp.dest('hugo/static/styles/'));
}

// CSS processing, minification
function minpostCss () {
  return gulp.src('src/styles/*.{css,pcss}')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.postcss(config.minProcessors))
    .pipe(plugins.rename({extname: '.min.css'}))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('hugo/static/styles/'));
}

// Copy Vendor CSS into hugo/static
gulp.task('vendorStyles', () => {
  return gulp.src('src/styles_vendor/*.css', { since: gulp.lastRun('vendorStyles') })
    .pipe(gulp.dest('hugo/static/styles_vendor/'));
});

//
// Javascript processing
//
// Linting
// .eslintrc.json can be used by your editor (see README.md)
// eslint rules for js aimed at browser are in config/
let lintJs = lazypipe()
    .pipe(plugins.eslint, 'config/eslint.json')
    .pipe(plugins.eslint.format);

// dev js tasks
function scripts () {
  return gulp.src('src/scripts/*.js', { since: gulp.lastRun(scripts) })
    .pipe(lintJs())
    .pipe(gulp.dest('hugo/static/scripts/'));
}
function scriptsHead () {
  return gulp.src('src/scripts_head/*.js', { since: gulp.lastRun(scriptsHead) })
    .pipe(lintJs())
    .pipe(gulp.dest('hugo/static/scripts_head/'));
}

// Javascript minification and source mapping
// TODO Possibly add concatenation (not really needed when served via HTTP2)
let minJs = lazypipe()
    .pipe(plugins.sourcemaps.init)
      .pipe(plugins.uglify)
      .pipe(plugins.rename, {extname: '.min.js'})
    .pipe(plugins.sourcemaps.write, '.');

// stage and live js tasks
function minscripts () {
  return gulp.src('src/scripts/*.js')
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts/'));
}
function minscriptsHead () {
  return gulp.src('src/scripts_head/*.js')
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts_head/'));
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

//
// Copy other assets like icons and txt files from src to hugo/static
gulp.task('copy', () => {
  return gulp.src('src/*.*', { since: gulp.lastRun('copy') })
    .pipe(gulp.dest('hugo/static/'));
});


//
// HTML templates
// Copy HTML templates from src/layouts to hugo/layouts
// We cant lint and minify here because of hugo specific code
function html () {
  return gulp.src('src/layouts/**/*.html', { since: gulp.lastRun(html) })
    .pipe(gulp.dest('hugo/layouts/'));
}

//
// Inject css and js into templates
function injectHead () {
  let modernizrPath = gulp.src(['hugo/static/scripts_vendor/modernizr.custom.js'], {read: false});
  let scriptsHead = gulp.src('hugo/static/scripts_head/*.js', {read: false});
  let vendorCss = gulp.src('hugo/static/styles_vendor/*.css', {read: false});
  let projectCss = gulp.src('hugo/static/styles/*.css', {read: false});

  return gulp.src('hugo/layouts/partials/head-meta.html')
    .pipe(plugins.inject(sseries(modernizrPath, scriptsHead),
      {selfClosingTag: true, ignorePath: 'hugo/static/', name: 'head'}))
    .pipe(plugins.inject(sseries(vendorCss, projectCss), {ignorePath: 'hugo/static/'}))
    .pipe(gulp.dest('hugo/layouts/partials/'));
}

function injectFoot () {
  return gulp.src('hugo/layouts/partials/footer-scripts.html')
    .pipe(plugins.inject(gulp.src(['hugo/static/scripts/*.js'],
      {read: false}), {ignorePath: 'hugo/static/'}))
    .pipe(gulp.dest('hugo/layouts/partials/'));
}


//
// Hugo
// -D is buildDrafts
// -F is buildFuture
function hugo (status) {
  let exec = require('child_process').execSync;
  let cmd = 'hugo --config=hugo/config.toml -s hugo/';
  if (status === 'stage') {
    cmd += ' -D -d published/stage/ --baseURL="' + config.hugoBaseUrl.stage + '"';
    plugins.gulpUtil.log('hugo command: \n' + cmd);
  } else if (status === 'live') {
    cmd += ' -d published/live/ --baseURL="' + config.hugoBaseUrl.live + '"';
    plugins.gulpUtil.log('hugo command: \n' + cmd);
  } else {
    cmd += ' -DF -d published/dev/';
    plugins.gulpUtil.log('hugo command: \n' + cmd);
  }

  let result = exec(cmd, {encoding: 'utf-8'});
  plugins.gulpUtil.log('hugo reports: \n' + result);
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


//
// HTML linting & minification
gulp.task('htmlDev', () => {
  return gulp.src('hugo/published/dev/**/*.html', { since: gulp.lastRun('htmlDev') })
    .pipe(plugins.htmltidy(config.htmltidyOptions))
    .pipe(gulp.dest('hugo/published/dev/'));
});

gulp.task('htmlStage', () => {
  return gulp.src('hugo/published/stage/**/*.html')
    .pipe(plugins.htmltidy(config.htmltidyOptions))
    .pipe(plugins.htmlmin(config.htmlminOptions))
    .pipe(gulp.dest('hugo/published/stage/'));
});

gulp.task('htmlLive', () => {
  return gulp.src('hugo/published/live/**/*.html')
    .pipe(plugins.htmltidy(config.htmltidyOptions))
    .pipe(plugins.htmlmin(config.htmlminOptions))
    .pipe(gulp.dest('hugo/published/live/'));
});


//
// Testing
// Jasmine, Mocha...
// TODO: what to test?


//
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

// Clean any assets we output into hugo/static (except images)
function cleanStatic (done) {
  return del([
    'hugo/static/scripts/*',
    'hugo/static/scripts_head/*',
    'hugo/static/scripts_vendor/*',
    'hugo/static/styles/*',
    'hugo/static/styles_vendor/*'
  ], done);
}

// Clean any assets we output into hugo/layouts
function cleanLayouts (done) {
  return del(['hugo/layouts/**/*.html'], done);
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


//
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
  gulp.watch('src/img_tmp').on('change', gulp.series(imgResponsive, imgOptim, imgMin, 'hugoDev', 'htmlDev', reload));
  gulp.watch('src/styles/*.{css,pcss}').on('change', gulp.series(postCss, injectHead, 'hugoDev', 'htmlDev', reload));
  gulp.watch('src/styles/partials/*.{css,pcss}').on('change', gulp.series(postCss, injectHead, 'hugoDev', 'htmlDev', reload));
  gulp.watch('src/styles_vendor/*.css').on('change', gulp.series('vendorStyles', injectHead, 'hugoDev', 'htmlDev', reload));
  gulp.watch('src/*.*').on('change', gulp.series('copy', 'hugoDev', 'htmlDev', reload));
  gulp.watch('config/modernizr-config.json').on('change', gulp.series('custoModernizr', injectHead, 'hugoDev', 'htmlDev', reload));
  gulp.watch('src/scripts/*.js').on('change', gulp.series(scripts, injectFoot, 'hugoDev', 'htmlDev', reload));
  gulp.watch('src/scripts_head/*.js').on('change', gulp.series(scriptsHead, injectHead, 'hugoDev', 'htmlDev', reload));
  gulp.watch('src/layouts/**/*.html').on('change', gulp.series(html, injectHead, injectFoot, 'hugoDev', 'htmlDev', reload));
  gulp.watch(['hugo/archetypes/*', 'hugo/content/', 'hugo/data/', 'hugo/config.*']).on('change', gulp.series('hugoDev', reload));
});


//
// Deploy

// Deploy to staging
gulp.task('upstage', () => {
  return Promise.all([
    rsync(config.stageRsyncOptions, function(error, stdout, stderr, cmd) {
      plugins.gulpUtil.log('Running: ' + cmd);
      plugins.gulpUtil.log(stdout);
    })
  ]);
});

// Deploy to live
gulp.task('golive', () => {
  return Promise.all([
    rsync(config.liveRsyncOptions, function(error, stdout, stderr, cmd) {
      plugins.gulpUtil.log('Running: ' + cmd);
      plugins.gulpUtil.log(stdout);
    })
  ]);
});


//
// 'gulp' is the main development task, essentially dev + watch + browsersync
gulp.task('default',
  gulp.series(
    gulp.parallel(cleanStatic, cleanLayouts, cleanDev),
    gulp.parallel('custoModernizr', postCss, scripts, scriptsHead),
    gulp.parallel('copy', html, 'vendorStyles'),
    gulp.parallel(injectHead, injectFoot),
    'hugoDev',
    'htmlDev',
    'watcher'
  )
);
// 'gulp dev' a single run, hugo will generate pages for drafts and future posts
gulp.task('dev',
  gulp.series(
    gulp.parallel(cleanStatic, cleanLayouts, cleanDev),
    gulp.parallel('custoModernizr', postCss, scripts, scriptsHead),
    gulp.parallel('copy', html, 'vendorStyles'),
    gulp.parallel(injectHead, injectFoot),
    'hugoDev',
    'htmlDev'
  )
);
// 'gulp stage' a single run, hugo will generate pages for drafts
gulp.task('stage',
  gulp.series(
    gulp.parallel(cleanStatic, cleanLayouts, cleanStage),
    gulp.parallel('custoModernizr', minpostCss, minscripts, minscriptsHead),
    gulp.parallel('copy', html, 'vendorStyles'),
    gulp.parallel(injectHead, injectFoot),
    'hugoStage',
    'htmlStage'
  )
);
// 'gulp live' a single run, production only
gulp.task('live',
  gulp.series(
    gulp.parallel(cleanStatic, cleanLayouts, cleanLive),
    gulp.parallel('custoModernizr', minpostCss, minscripts, minscriptsHead),
    gulp.parallel('copy', html, 'vendorStyles'),
    gulp.parallel(injectHead, injectFoot),
    'hugoLive',
    'htmlLive'
  )
);

// Clean and regenerate all images
gulp.task('reprocess', gulp.series(cleanImages, imgMagic, imgResponsive, imgOptim, imgMin));
// Clean and regenerate responsive images (use after modifying responsive config)
gulp.task('reprocess:responsive', gulp.series(cleanResponsive, imgResponsive, imgOptim));


// Task used for debugging function based task or tasks
gulp.task('dt', gulp.series('copy'));
