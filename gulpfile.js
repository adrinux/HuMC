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
    'gulp-sharp': 'sharp',
    'gulp-gm': 'gm',
    'gulp-imageoptim': 'imageOptim'
  }
});

// Simplify calls to browser-sync
const sync = browserSync.create();


//
// Import task configuration
var config = require('./config/config.js');


// Image processing with Sharp (vips)
// install external dependency vips then gulp-sharp
// for vips links see: https://www.npmjs.com/package/gulp-sharp
// then: npm install gulp-sharp --save-dev
gulp.task('sharp', () => {
  return gulp.src('src/img_raw/*')
    .pipe(plugins.newer('src/img_tmp/'))
    .pipe(plugins.sharp(config.sharpOptions))
    //.pipe(plugins.rename((config.sharpRename)))
  .pipe(gulp.dest('src/img_tmp/'));
});


//
// Responsive Images
// Generate diiferent sized images for srcset
gulp.task('responsive', () => {
  return gulp.src('src/img_tmp/**/*.{jpg,png}')
    .pipe(plugins.newer('src/img_responsive/'))
    .pipe(plugins.responsive(config.responsiveOptions, config.responsiveGlobals))
  .pipe(gulp.dest('src/img_responsive/'));
});


//
// Optimize and copy images to final destination
// Might want to add filter here, no need to send svg to imageOptim for example
gulp.task('imgMin', () => {
  return gulp.src('src/img_tmp/**/*', 'src/img_responsive/**/*')
    .pipe(plugins.newer('hugo/static/images/'))
    .pipe(plugins.imagemin(config.imageminOptions))
    .pipe(plugins.imageOptim.optimize(config.imageoptimOptions))
  .pipe(gulp.dest('hugo/static/images/'));
});

//
// Composite image processing task
// Calls above automated editing, responsive derivative generation and
// optimisation tasks
gulp.task('images',
  gulp.series(
    'sharp',
    'responsive',
    'imgMin'
  )
);


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
    .pipe(lintJs())
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts/'));
});
gulp.task('minscriptsHead', () => {
  return gulp.src('src/scripts_head/*.js', { since: gulp.lastRun('minscriptsHead') })
    .pipe(lintJs())
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts_head/'));
});


// TODO
//
// Modernizr
// Read config and generate a custom build


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
gulp.task('inject', () => {
  return gulp.src('hugo/layouts/index.html')
    .pipe(plugins.inject(gulp.src('hugo/static/scripts_head/*.js', {read: false}), {selfClosingTag: true, ignorePath: 'hugo/static/', name: 'head'}))
    .pipe(plugins.inject(gulp.src('hugo/static/scripts/bower-concat.min.js', {read: false}), {ignorePath: 'hugo/static/'}))
    .pipe(plugins.inject(gulp.src(['hugo/static/scripts/*.js', '!hugo/static/scripts/bower-concat.min.js'], {read: false}), {ignorePath: 'hugo/static/'}))
    .pipe(plugins.inject(gulp.src('hugo/static/styles/*.css', {read: false}), {ignorePath: 'hugo/static/'}))
    .pipe(gulp.dest('hugo/layouts/'));
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
// Cleaning
// Specific cleaning tasks for dev/stage/live of hugo/published.
gulp.task('clean:dev', () => {
  return Promise.all([ del('hugo/published/dev/') ]);
});
gulp.task('clean:stage', () => {
  return Promise.all([ del('hugo/published/stage/') ]);
});
gulp.task('clean:live', () => {
  return Promise.all([ del('hugo/published/live/') ]);
});
// Clean any assets we output into hugo/static
gulp.task('clean:static', () => {
  return Promise.all([
    del('hugo/static/scripts/*'),
    del('hugo/static/scripts_head/*'),
    del('hugo/static/styles/*')
  ]);
});
// Clean any assets we output into hugo/layouts
gulp.task('clean:layouts', () => {
  return Promise.all([
    del('hugo/layouts/**/*.html')
  ]);
});

// Clean temporary image files created during processing
gulp.task('clean:images', () => {
  return Promise.all([
    del('src/img_tmp/**/*'),
    del('hugo/static/images/*'),
    del('src/img_responsive/*'),
    del('hugo/static/images/responsive/*')
  ]);
});
// Clean only responsive image derivatives
gulp.task('clean:responsive', () => {
  return Promise.all([
    del('src/img_responsive/*'),
    del('hugo/static/images/responsive/*')
  ]);
});


// Clean everything at once (except images)
gulp.task('clean:all', () => {
  return Promise.all([
    del('hugo/static/scripts/*'),
    del('hugo/static/scripts_head/*'),
    del('hugo/static/styles/*'),
    del('hugo/layouts/**/*.html')
  ]);
});



//
// Watch files and serve with Browsersync
gulp.task('watchnsync', () => {
  sync.init({
    server: {
      baseDir: 'hugo/published/dev'
    }
  });

  gulp.watch('src/sass/*.scss', gulp.series('sass', 'inject', 'hugoDev', 'htmlDev'));
  gulp.watch('src/scripts/*.js', gulp.series('scripts', 'inject', 'hugoDev', 'htmlDev'));
  gulp.watch('src/scripts_head/*.js', gulp.series('scriptsHead', 'inject', 'hugoDev', 'htmlDev'));
  gulp.watch('bower_components', gulp.series('bowerjs', 'bowercss', 'inject', 'hugoDev', 'htmlDev'));
  gulp.watch('src/layouts/**/*.html', gulp.series('bowerjs', 'bowercss', 'inject', 'hugoDev','htmlDev'));
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
// Testing
// Jasmine, Mocha...
// TODO: what to test?


//
// 'gulp' is the main development task, essentially dev + watch + browsersync
gulp.task('default',
  gulp.series(
    gulp.parallel('clean:all', 'clean:dev'),
    gulp.parallel('bowerjs', 'bowercss', 'images'),
    gulp.parallel('sass', 'scripts', 'scriptsHead'),
    'html',
    'inject',
    'hugoDev',
    'htmlDev',
    'watchnsync'
  )
);
// 'gulp dev' a single run, hugo will generate pages for drafts and future posts
gulp.task('dev',
  gulp.series(
    gulp.parallel('clean:all', 'clean:dev'),
    gulp.parallel('bowerjs', 'bowercss', 'images'),
    gulp.parallel('sass', 'scripts', 'scriptsHead'),
    'html',
    'inject',
    'hugoDev',
    'htmlDev'
  )
);
// 'gulp stage' a single run, hugo will generate pages for drafts
gulp.task('stage',
  gulp.series(
    gulp.parallel('clean:all', 'clean:stage'),
    gulp.parallel('bowerjs', 'bowercss', 'images'),
    gulp.parallel('minsass','minscripts', 'minscriptsHead'),
    'html',
    'inject',
    'hugoStage',
    'htmlStage'
  )
);
// 'gulp live' a single run, production only
gulp.task('live',
  gulp.series(
    gulp.parallel('clean:all', 'clean:live'),
    gulp.parallel('bowerjs', 'bowercss', 'images'),
    gulp.parallel('minsass','minscripts', 'minscriptsHead'),
    'html',
    'inject',
    'hugoLive',
    'htmlLive'
  )
);
