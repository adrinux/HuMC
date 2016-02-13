'use strict';

require('babel-polyfill');
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var gulpFilter = require('gulp-filter');
var del = require('del');
var lazypipe = require('lazypipe');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');
var rsync = require('rsyncwrapper');


// Auto load Gulp plugins
const plugins = gulpLoadPlugins({
  rename: {
    'gulp-util': 'gulpUtil',
    'gulp-inject': 'inject',
    'gulp-concat': 'concat',
    'gulp-htmlmin': 'htmlmin',
    'gulp-htmltidy': 'htmltidy',
    'gulp-gm': 'gm',
    'gulp-imageoptim': 'imageOptim'
  }
});

// Simplify calls to browser-sync
const sync = browserSync.create();

//
// Import task configuration
var config = require('./config/config.js');


//
// Image processing via gulp-gm
function imgMagic() {
  let magicCache = require('gulp-cache-money')({ cacheFile: __dirname + '/.cache-magic' });
  return gulp.src('src/img_raw/*.{jpg,png}')
    .pipe(magicCache({cascade: false}))
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
  let responsiveCache = require('gulp-cache-money')({ cacheFile: __dirname + '/.cache-responsive' });
  return gulp.src('src/img_tmp/**/*.{jpg,png}')
    .pipe(responsiveCache({cascade: false}))
    .pipe(plugins.responsive(config.responsiveOptions, config.responsiveGlobals))
  .pipe(gulp.dest('src/img_responsive/'));
}

//
// Optimize responsive images and copy to final location
// function imgOptim () {
// }
// function customBuild () {
//   let exec = require('child_process').exec;
//   let cmd = './node_modules/.bin/modernizr ';
//   cmd += '-c ./config/modernizr-config.json ';
//   cmd += '-d ./hugo/static/scripts_head/modernizr.custom.js';
//   exec(cmd, {encoding: 'utf-8'});
// }




//
// Optimize and copy svg or gif images to final destination
gulp.task('imgMin', () => {
  let imgminCache = require('gulp-cache-money')({ cacheFile: __dirname + '/.cache-imgmin' });
  return gulp.src('src/img_tmp/**/*.{svg,gif}')
    .pipe(imgminCache({cascade: false}))
    .pipe(plugins.imagemin(config.imageminOptions))
  .pipe(gulp.dest('hugo/static/images/'));
});


//
// CSS processing, linting
gulp.task('sass', () => {
  return gulp.src(config.sassPaths.src, { since: gulp.lastRun('sass') })
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.postcss(config.processors))
    .pipe(gulp.dest(config.sassPaths.dest))
    .pipe(sync.stream());
});

// CSS processing, linting, minification
gulp.task('minsass', () => {
  return gulp.src(config.sassPaths.src, { since: gulp.lastRun('minsass') })
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
      .pipe(plugins.postcss(config.minProcessors))
      .pipe(plugins.rename({extname: '.min.css'}))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(config.sassPaths.dest));
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

// Javascript minification and source mapping
// TODO Possibly add concatenation (not really needed when served via HTTP2)
let minJs = lazypipe()
    .pipe(plugins.sourcemaps.init)
      .pipe(plugins.uglify)
      .pipe(plugins.rename, {extname: '.min.js'})
    .pipe(plugins.sourcemaps.write, '.');

// dev js tasks
gulp.task('scripts', () => {
  return gulp.src('src/scripts/*.js', { since: gulp.lastRun('scripts') })
    .pipe(lintJs())
    .pipe(gulp.dest('hugo/static/scripts/'))
    .pipe(sync.stream());
});
gulp.task('scriptsHead', () => {
  return gulp.src('src/scripts_head/*.js', { since: gulp.lastRun('scriptsHead') })
    .pipe(lintJs())
    .pipe(gulp.dest('hugo/static/scripts_head/'))
    .pipe(sync.stream());
});

// stage and live js tasks
gulp.task('minscripts', () => {
  return gulp.src('src/scripts/*.js', { since: gulp.lastRun('minscripts') })
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts/'));
});
gulp.task('minscriptsHead', () => {
  return gulp.src('src/scripts_head/*.js', { since: gulp.lastRun('minscriptsHead') })
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts_head/'));
});

// Modernizr
// Read custom config and generate a custom build
function customBuild () {
  let exec = require('child_process').exec;
  let cmd = './node_modules/.bin/modernizr ';
  cmd += '-c ./config/modernizr-config.json ';
  cmd += '-d ./hugo/static/scripts_head/modernizr.custom.js';
  exec(cmd, {encoding: 'utf-8'});
}

gulp.task('custoModernizr', () => {
  return Promise.all([ customBuild() ]);
});


//
// Bower components process
// Javascript
gulp.task('bowerjs', () => {
  let onlyjs = gulpFilter(['*.js']);
  return gulp.src(mainBowerFiles())
    .pipe(onlyjs)
    .pipe(plugins.concat('bower-concat.js'))
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts/'));
});

// CSS
gulp.task('bowercss', () => {
  let onlycss = gulpFilter(['*.css']);
  return gulp.src(mainBowerFiles())
    .pipe(onlycss)
    .pipe(gulp.dest('hugo/static/styles/'));
});


// TODO
//
// SASS
// auto link bower based SASS into our main.scss
// gulp.task('bowersass', () => {
//   let onlySass = gulpFilter(['*.scss']);
//   return gulp.src(mainBowerFiles())
//     .pipe(onlySass)
//     .pipe(gulp.dest('src/sass/main.scss'));
// });


//
// HTML templates
// Copy HTML templates from src/layouts to hugo/layouts
// We cant lint and minify here because of hugo specific code
gulp.task('html', () => {
  return gulp.src('src/layouts/**/*.html', { since: gulp.lastRun('html') })
    .pipe(gulp.dest('hugo/layouts/'));
});


//
// Inject css and js
// Inject minified assets in only in stage/live
gulp.task('inject:head', () => {
  return gulp.src('hugo/layouts/partials/head-meta.html')
    .pipe(plugins.inject(gulp.src('hugo/static/scripts_head/*.js', {read: false}), {selfClosingTag: true, ignorePath: 'hugo/static/', name: 'head'}))
    .pipe(plugins.inject(gulp.src('hugo/static/styles/*.css', {read: false}), {ignorePath: 'hugo/static/'}))
    .pipe(gulp.dest('hugo/layouts/partials/'));
});

gulp.task('inject:footer', () => {
  return gulp.src('hugo/layouts/partials/footer-scripts.html')
    .pipe(plugins.inject(gulp.src('hugo/static/scripts/bower-concat.min.js', {read: false}), {ignorePath: 'hugo/static/'}))
    .pipe(plugins.inject(gulp.src(['hugo/static/scripts/*.js', '!hugo/static/scripts/bower-concat.min.js'], {read: false}), {ignorePath: 'hugo/static/'}))
    .pipe(gulp.dest('hugo/layouts/partials/'));
});


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
    cmd += ' -DF -d published/dev/ --baseURL="' + config.hugoBaseUrl.dev + '"';
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
  return gulp.src('hugo/published/dev/**/*.html', { since: gulp.lastRun('sass') })
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
    'hugo/static/styles/*'
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
    'hugo/static/images/responsive/*',
    '.cache-magic',
    '.cache-responsive',
    '.cache-imgmin'
  ], done);
}

// Clean only responsive image derivatives
function cleanResponsive (done) {
  return del([
    'src/img_responsive/*',
    'hugo/static/images/responsive/*',
    '.cache-responsive',
    '.cache-imgmin'
  ], done);
}


//
// Watch files and serve with Browsersync
gulp.task('watchnsync', () => {
  sync.init({
    server: {
      baseDir: 'hugo/published/dev'
    }
  });

  gulp.watch('src/img_tmp', gulp.series('responsive', 'imgMin', 'hugoDev', 'htmlDev'));
  gulp.watch('src/sass/*.scss', gulp.series('sass', 'inject:head', 'hugoDev', 'htmlDev'));
  gulp.watch('config/modernizr-config.json', gulp.series('custoModernizr', 'inject:head', 'hugoDev', 'htmlDev'));
  gulp.watch('src/scripts/*.js', gulp.series('scripts', 'inject:footer', 'hugoDev', 'htmlDev'));
  gulp.watch('src/scripts_head/*.js', gulp.series('scriptsHead', 'inject:head', 'hugoDev', 'htmlDev'));
  gulp.watch('bower_components', gulp.series('bowerjs', 'bowercss', 'inject:footer', 'hugoDev', 'htmlDev'));
  gulp.watch('src/layouts/**/*.html', gulp.series('bowerjs', 'bowercss', 'inject:head', 'inject:footer', 'hugoDev','htmlDev'));
  gulp.watch([
    'hugo/archetypes/*',
    'hugo/content/',
    'hugo/data/'
  ], gulp.series('hugoDev')).on('change', sync.reload);
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
    gulp.parallel('custoModernizr', 'bowerjs', 'bowercss', imgMagic),
    gulp.parallel('sass', 'scripts', 'scriptsHead', imgResponsive),
    gulp.parallel('html', 'imgMin'),
    gulp.parallel('inject:head', 'inject:footer'),
    'hugoDev',
    'htmlDev',
    'watchnsync'
  )
);
// 'gulp dev' a single run, hugo will generate pages for drafts and future posts
gulp.task('dev',
  gulp.series(
    gulp.parallel(cleanStatic, cleanLayouts, cleanDev),
    gulp.parallel('custoModernizr', 'bowerjs', 'bowercss', imgMagic),
    gulp.parallel('sass', 'scripts', 'scriptsHead', imgResponsive),
    gulp.parallel('html', 'imgMin'),
    gulp.parallel('inject:head', 'inject:footer'),
    'hugoDev',
    'htmlDev'
  )
);
// 'gulp stage' a single run, hugo will generate pages for drafts
gulp.task('stage',
  gulp.series(
    gulp.parallel(cleanStatic, cleanLayouts, cleanStage),
    gulp.parallel('custoModernizr', 'bowerjs', 'bowercss', imgMagic),
    gulp.parallel('minsass','minscripts', 'minscriptsHead', imgResponsive),
    gulp.parallel('html', 'imgMin'),
    gulp.parallel('inject:head', 'inject:footer'),
    'hugoStage',
    'htmlStage'
  )
);
// 'gulp live' a single run, production only
gulp.task('live',
  gulp.series(
    gulp.parallel(cleanStatic, cleanLayouts, cleanLive),
    gulp.parallel('custoModernizr', 'bowerjs', 'bowercss', imgMagic),
    gulp.parallel('minsass','minscripts', 'minscriptsHead', imgResponsive),
    gulp.parallel('html', 'imgMin'),
    gulp.parallel('inject:head', 'inject:footer'),
    'hugoLive',
    'htmlLive'
  )
);

// Clean and regenerate all images
gulp.task('reprocess', gulp.series(cleanImages, imgMagic, imgResponsive, 'imgMin'));
// Clean and regenerate responsive images (use after modifying responsive config)
gulp.task('reprocess:responsive', gulp.series(cleanResponsive, imgResponsive));
