'use strict';

import 'babel-polyfill';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import lazypipe from 'lazypipe';
import browserSync from 'browser-sync';
import autoprefixer from 'autoprefixer';
import colorguard from 'colorguard';
import cssnano from 'cssnano';
import reporter from 'postcss-reporter';
import {stream as wiredep} from 'wiredep';


// Auto load Gulp plugins
const plugins = gulpLoadPlugins({
  rename: {
    'gulp-util': 'gulpUtil',
    'gulp-inject': 'inject'
  }
});


// Simplify calls to browser-sync
const sync = browserSync.create();

//
// Constants, mostly paths
// TODO: Move these out into a seperate config.js
const dirs = {
  src: 'src/',
  dest: 'hugo/static/'
};

const sassPaths = {
  src: dirs.src + 'sass/main.scss',
  dest: dirs.dest + 'styles/'
};

const hugoPaths = {
  StageBaseUrl: 'http://stage.example.com',
  LiveBaseUrl: 'http://example.com',
  DevBaseUrl: 'http://localhost:3000'
};

//
// CSS processing, linting
gulp.task('styles', () => {
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
gulp.task('minstyles', () => {
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
// eslint rules for js aimed at browser in config/
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
  return gulp.src(dirs.src + 'scripts/*.js')
    .pipe(lintJs())
    .pipe(gulp.dest(dirs.dest + 'scripts/'))
    .pipe(sync.stream());
});
gulp.task('scriptsHead', () => {
  return gulp.src(dirs.src + 'scripts_head/*.js')
    .pipe(lintJs())
    .pipe(gulp.dest(dirs.dest + 'scripts_head/'))
    .pipe(sync.stream());
});

// stage and live js tasks
gulp.task('minscripts', () => {
  return gulp.src(dirs.src + 'scripts/*.js')
    .pipe(lintJs())
    .pipe(minJs())
    .pipe(gulp.dest(dirs.dest + 'scripts/'));
});
gulp.task('minscriptsHead', () => {
  return gulp.src(dirs.src + 'scripts_head/*.js')
    .pipe(lintJs())
    .pipe(minJs())
    .pipe(gulp.dest(dirs.dest + 'scripts_head/'));
});

//
// Wiredep
// modernizr, generate a custom build like generator-webapp
// Bower components? Susy?
gulp.task('wiredep', () => {
  let wiredepoptions = {
    directory: 'bower_components'
  };
  return gulp.src('hugo/layouts/index.html')
    .pipe(wiredep);

});

//
// Inject css and js
// Inject minified assets in only in stage/live
gulp.task('inject', () => {
  return gulp.src('hugo/layouts/index.html')
    .pipe(plugins.inject(gulp.src('hugo/static/scripts_head/*.js', {read: false}), {ignorePath: 'hugo/static/', name: 'head'}))
    .pipe(plugins.inject(gulp.src('hugo/static/scripts/*.js', {read: false}), {ignorePath: 'hugo/static/'}))
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
// HTML Linting
// HTML minification?
// Will need to run hugo first, then check output?

//
// Testing
// Jasmine, Mocha...
// what to test?

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

//
// Watch files and serve with Browsersync
gulp.task('watchnsync', () => {
  sync.init({
    server: {
      baseDir: 'hugo/published/dev'
    }
  });

  gulp.watch(dirs.src + 'sass/*.scss', gulp.series('styles', 'inject', 'hugoDev'));
  gulp.watch(dirs.src + 'scripts/*.js', gulp.series('scripts', 'inject', 'hugoDev'));
  gulp.watch(dirs.src + 'scripts_head/*.js', gulp.series('scriptsHead', 'inject', 'hugoDev'));
  gulp.watch([
    'hugo/archetypes/*',
    'hugo/layouts',
    'hugo/content',
    'hugo/data'
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
// Make sure you can rsync from the CLI before running the 'grunt upstage'
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
// 'gulp' is the main development task, essentially dev + watch + browsersync
gulp.task('default',
  gulp.series(
    gulp.parallel('clean:static', 'clean:dev'),
    gulp.parallel('styles', 'scripts', 'scriptsHead'),
    'inject',
    'hugoDev',
    'watchnsync'
  )
);
// 'gulp dev' a single run, hugo will generate pages for drafts and future posts
gulp.task('dev',
  gulp.series(
    gulp.parallel('clean:static', 'clean:dev'),
    gulp.parallel('styles', 'scripts', 'scriptsHead'),
    'inject',
    'hugoDev'
  )
);
// 'gulp stage' a single run, hugo will generate pages for drafts
gulp.task('stage',
  gulp.series(
    gulp.parallel('clean:static', 'clean:stage'),
    gulp.parallel('minstyles','minscripts', 'minscriptsHead'),
    'inject',
    'hugoStage'
  )
);
// 'gulp live' a single run, production only
gulp.task('live',
  gulp.series(
    gulp.parallel('clean:static', 'clean:live'),
    gulp.parallel('minstyles','minscripts', 'minscriptsHead'),
    'inject',
    'hugoLive'
  )
);
