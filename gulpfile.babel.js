'use strict';

import 'babel-polyfill';
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
  src: dirs.src + 'sass/main.scss',
  dest: dirs.dest + 'styles/'
};

const hugoPaths = {
  StageBaseUrl: 'http://stage.example.com/',
  LiveBaseUrl: 'http://example.com/'
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
  return gulp.src(sassPaths.dest + 'main.css')
    .pipe($.minifyCss())
    .pipe($.rename({extname: '.min.css'}))
    .pipe(gulp.dest(sassPaths.dest));
});

// Javascript processing and minification
gulp.task('scripts', () => {
  return gulp.src(dirs.src + 'scripts/*.js')
    .pipe($.uglify())
    .pipe($.rename({extname: '.min.js'}))
    .pipe(gulp.dest(dirs.dest + 'scripts/'));
});
// eslint on gulpfile? as well as scripts
// eslint vs uglify
// babel compilation of ES6? Still needed?

// Image processing (with gm/im)

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

// Hugo
// -D is buildDrafts
// -F is buildFuture
function hugo (status) {
  let exec = require('child_process').execSync;
  let cmd = 'hugo --config=hugo/config.toml -s hugo/';
  if (status === 'stage') {
    cmd += ' -D -d published/stage/ --baseURL="' + hugoPaths.StageBaseUrl + '"';
    $.gutil.log('hugo command: \n' + cmd);
  } else if (status === 'live') {
    cmd += ' -d published/live/ --baseURL="' + hugoPaths.LiveBaseUrl + '"';
    $.gutil.log('hugo command: \n' + cmd);
  } else {
    cmd += ' -DF -d published/dev/';
    $.gutil.log('hugo command: \n' + cmd);
  }

  let result = exec(cmd, {encoding: 'utf-8'});
  $.gutil.log('hugo reports: \n' + result);
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

// Wiredep
// modernizr, generate a custom build like generator-webapp
// Susy?

// HTML Linting
// HTML minification?
// Will need to run hugo first, then check output?

// Testing
// Jasmine, Mocha...

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

// Watch for changes
// browsersync too

// Build (staging and prod)?
// Is this really needed. Might simplify task definitions

// serve/watch (dev)
// needs to spawn a hugo watch task too (and pass back hugo errors)

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

// Tasks
gulp.task('default', gulp.parallel('styles', 'scripts'));
gulp.task('dev', gulp.series('clean:dev', 'styles', 'scripts', 'hugoDev'));
gulp.task('stage', gulp.series('clean:stage', gulp.parallel('styles', 'scripts'), 'minstyles', 'hugoStage'));
gulp.task('live', gulp.series('clean:live', gulp.parallel('styles', 'scripts'), 'minstyles', 'hugoLive'));

