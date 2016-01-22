'use strict';

require('babel-polyfill');
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var gulpFilter = require('gulp-filter');
var del = require('del');
var lazypipe = require('lazypipe');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');
var autoprefixer = require('autoprefixer');
var colorguard = require('colorguard');
var cssnano = require('cssnano');
var reporter = require('postcss-reporter');

// Auto load Gulp plugins
const plugins = gulpLoadPlugins({
  rename: {
    'gulp-util': 'gulpUtil',
    'gulp-inject': 'inject',
    'gulp-concat': 'concat',
    'gulp-htmlmin': 'htmlmin',
    'gulp-htmltidy': 'htmltidy'
  }
});

// Simplify calls to browser-sync
const sync = browserSync.create();


//
// Constants, mostly paths
const sassPaths = {
  src: 'src/sass/main.scss',
  dest: 'hugo/static/styles/'
};

// TODO: Move these out into a seperate config.js for per site settings
const hugoPaths = {
  StageBaseUrl: 'http://stage.example.com',
  LiveBaseUrl: 'http://example.com',
  DevBaseUrl: 'http://localhost:3000'
};


//
// CSS processing, linting
gulp.task('sass', () => {
  let processors = [
    colorguard({threshold: ['3']}),
    autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
    reporter()
  ];
  return gulp.src(sassPaths.src)
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.postcss(processors))
    .pipe(gulp.dest(sassPaths.dest))
    .pipe(sync.stream());
});

// CSS processing, linting, minification
gulp.task('minsass', () => {
  let processors = [
    colorguard({threshold: ['3']}),
    autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
    cssnano(),
    reporter()
  ];
  return gulp.src(sassPaths.src)
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
      .pipe(plugins.postcss(processors))
      .pipe(plugins.rename({extname: '.min.css'}))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(sassPaths.dest));
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
  return gulp.src('src/scripts/*.js')
    .pipe(lintJs())
    .pipe(gulp.dest('hugo/static/scripts/'))
    .pipe(sync.stream());
});
gulp.task('scriptsHead', () => {
  return gulp.src('src/scripts_head/*.js')
    .pipe(lintJs())
    .pipe(gulp.dest('hugo/static/scripts_head/'))
    .pipe(sync.stream());
});

// stage and live js tasks
gulp.task('minscripts', () => {
  return gulp.src('src/scripts/*.js')
    .pipe(lintJs())
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts/'));
});
gulp.task('minscriptsHead', () => {
  return gulp.src('src/scripts_head/*.js')
    .pipe(lintJs())
    .pipe(minJs())
    .pipe(gulp.dest('hugo/static/scripts_head/'));
});


//
// TODO modernizr, generate a custom build via the node module NOT bower
// use config options passed via gulp to generate build rather than automatic
// apps which scan js (reputedly tend to break things)
// keep config in seperate config file
// make sure resulting modernizr.js is injected into head, either with its own
// task or by extending scriptsHead, minscriptsHead
// currently processing it into static/scripts_head will allow inject task to
// include it automatically, but still need to correct order of linking


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

// SASS
// auto link bower based sass like susy into a main sass
// needs gulp-inject and transform function
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
  return gulp.src('src/layouts/**/*.html')
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
// Image processing (with gm/im)
// move this to an external file, may not be used for all projects

// THIS NEEDS CONVERTED
// Process Images with graphicsmagick or imagemagick
// To use:
// - uncomment section starting with gm below
// - uncomment the task 'process' at the bottom of this file
// - create folder for unprocessed images: "mkdir app/images_raw"
// - install grunt-gm: "npm install grunt-gm --save-dev"
// - run "grunt process" to process new images (add into a build or watch
// task if you're doing this a lot)
// You can configure subfolders etc if you need multiple processing steps
// See https://github.com/h0ward/grunt-gm for Usage
// The following tasks are just an example, fit to your needs.
// gm: {
//   crop: {
//     options: {
//       // uses graphicsmagick uness imagemagick is set as an option
//       // default: false, check if dest file exists and size > 0
//       skipExisting: true,
//       // default: false
//       stopOnError: false,
//     },
//     files: [{
//       expand: true,
//       cwd: '<%%= config.app %>/images_raw',
//       src: ['**.{jpg,gif,png}'],
//       dest: '<%%= config.app %>/images',
//       filter: 'isFile',
//       options: {
//         // imageMagick: true,
//         stopOnError: true
//       },
//       // image is passed as stream beteen tasks
//       tasks: [
//         { // scale
//           resize: [500,250, "^"],
//         },{ // crop
//           gravity: ['Center'],
//           extent: [250,125]
//         }
//       ]
//     }],
//   }
// },

//
// Responsive Images
// Generate diiferent sized images for srcset

// Image optimisation
// Image optimisation task using imageoptim and jpegmini *OSX only*
// If you disable this then tweak the imagemin task above to process jpg,png
// imagemin task deals with gif, imageoptim with jpg and png
// Switch jpegMini to false if its not installed. You may need to launch
// JPEGmini.app before this task runs.
// imageOptim: {
//   optimise: {
//     options: {
//       jpegMini: true,
//       imageAlpha: true,
//       quitAfter: false
//     },
//     src: ['app/images/*.{jpg,jpeg,png}']
//   }
// },

//
// Hugo
// -D is buildDrafts
// -F is buildFuture
function hugo (status) {
  let exec = require('child_process').execSync;
  let cmd = 'hugo --config=hugo/config.toml -s hugo/';
  if (status === 'stage') {
    cmd += ' -D -d published/stage/ --baseURL="' + hugoPaths.StageBaseUrl + '"';
    plugins.gulpUtil.log('hugo command: \n' + cmd);
  } else if (status === 'live') {
    cmd += ' -d published/live/ --baseURL="' + hugoPaths.LiveBaseUrl + '"';
    plugins.gulpUtil.log('hugo command: \n' + cmd);
  } else {
    cmd += ' -DF -d published/dev/ --baseURL="' + hugoPaths.DevBaseUrl + '"';
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
let tidyOptions = {
  doctype: 'html5',
  hideComments: true,
  indent: true,
  indentSpaces: 2
};

let htmlminOptions = {
  collapseWhitespace: true,
  conservativeCollapse: true,
  preserveLineBreaks: true
};

gulp.task('htmlDev', () => {
  return gulp.src('hugo/published/dev/**/*.html')
    .pipe(plugins.htmltidy(tidyOptions))
    .pipe(gulp.dest('hugo/published/dev/'));
});

gulp.task('htmlStage', () => {
  return gulp.src('hugo/published/stage/**/*.html')
    .pipe(plugins.htmltidy(tidyOptions))
    .pipe(plugins.htmlmin(htmlminOptions))
    .pipe(gulp.dest('hugo/published/stage/'));
});

gulp.task('htmlLive', () => {
  return gulp.src('hugo/published/live/**/*.html')
    .pipe(plugins.htmltidy(tidyOptions))
    .pipe(plugins.htmlmin(htmlminOptions))
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

//
// Watch files and serve with Browsersync
gulp.task('watchnsync', () => {
  sync.init({
    server: {
      baseDir: 'hugo/published/dev'
    }
  });

  gulp.watch('src/sass/*.scss', gulp.series('sass', 'inject', 'hugoDev'));
  gulp.watch('src/scripts/*.js', gulp.series('scripts', 'inject', 'hugoDev', 'htmlDev'));
  gulp.watch('src/scripts_head/*.js', gulp.series('scriptsHead', 'inject', 'hugoDev', 'htmlDev'));
  gulp.watch('bower_components', gulp.series('bowerjs', 'bowercss', 'inject', 'hugoDev', 'htmlDev'));
  gulp.watch('src/layouts/layouts', gulp.series('bowerjs', 'bowercss', 'inject', 'hugoDev','htmlDev'));
  gulp.watch([
    'hugo/archetypes/*',
    'hugo/content/',
    'hugo/data/'
  ], gulp.series('hugoDev')).on('change', sync.reload);
});

//
// Deploy
// NEES CONVERSION
// Update stage and production sites
// deleteAll: Deletes objects in dest that aren't present in src or are
// specifically excluded. Prevents orphan files server side.
// Uncomment this section, configure dest/host.
// Uncomment the upstage and upprod task at the bottom of this gruntfile
// Make sure you can rsync = require() the CLI before running the 'grunt upstage'
// or 'grunt upprod' tasks.
// rsync: {
//   options: {
//     // -r recursive
//     // -t preserve modification times
//     // -o preserve owner
//     // -v verbose
//     // -z compress during transfer
//     // --chmod=ugo=rwX use destination default permissions
//     args: ['-rtozv', '--chmod=ugo=rwX', '--delete'],
//     exclude: ['.git*', 'cache', 'logs', '.DS_Store'],
//   },
//   stage: {
//     options: {
//       src: 'dist/',
//       dest: '/var/www/sitename-stage',
//       host: 'you@stage.example.com',
//       deleteAll: true
//     },
//   },
//   production: {
//     options: {
//       src: 'dist/',
//       dest: '/var/www/sitename',
//       host: 'you@example.com',
//       deleteAll: true
//     },
//   }
// },


//
// Testing
// Jasmine, Mocha...
// what to test?


//
// 'gulp' is the main development task, essentially dev + watch + browsersync
gulp.task('default',
  gulp.series(
    gulp.parallel('clean:static', 'clean:dev', 'clean:layouts'),
    gulp.parallel('bowerjs', 'bowercss'),
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
    gulp.parallel('clean:static', 'clean:dev', 'clean:layouts'),
    gulp.parallel('bowerjs', 'bowercss'),
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
    gulp.parallel('clean:static', 'clean:stage', 'clean:layouts'),
    gulp.parallel('bowerjs', 'bowercss'),
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
    gulp.parallel('clean:static', 'clean:live', 'clean:layouts'),
    gulp.parallel('bowerjs', 'bowercss'),
    gulp.parallel('minsass','minscripts', 'minscriptsHead'),
    'html',
    'inject',
    'hugoLive',
    'htmlLive'
  )
);
