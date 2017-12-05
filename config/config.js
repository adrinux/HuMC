'use strict';

//
// Configuration variables that we're likely to modify are in this file

module.exports = {

  //
  // Hugo is happiest with a 'baseurl' set. For dev runs http://localhost:3000
  // is set in Hugo's config.[toml,yaml,json] but we set it dynamically so we
  // can use different values for stage and production runs.
  // See Hugo docs: https://gohugo.io/overview/configuration/
  // Change Stage and Base Urls to the domains you're using
  hugoBaseUrl: {
    stage: 'http://stage.example.com',
    live: 'http://example.com'
  },


  //
  // Image processing

  // Optionally rename images processed with gm
  // Uncomment the rename line in the gulpfile.js 'imgMagic' task before use
  // For options see https://github.com/hparra/gulp-rename#notes
  magicRename: {
    suffix: '-sized'
  },

  // Responsive image generation via gulp-responsive
  // Sizes etc
  responsiveOptions: {
    '*.*': [{
      width: 320,
      rename: { suffix: '-mini' }
    }, {
      width: 640,
      rename: { suffix: '-small' }
    }, {
      width: 780,
      rename: { suffix: '-medium' }
    }, {
      width: 1140,
      rename: { suffix: '-large' }
    }, {
      width: 1280,
      rename: { suffix: '-xlarge' }
    }, {
      width: 320 * 2,
      rename: { suffix: '@2x' }
    }]
  },
  // Global options
  responsiveGlobals: {
    quality: 86,
    progressive: false,
    withMetadata: false,
    withoutEnlargement: true,
    errorOnEnglargement: false,
    errorOnUnusedConfig: false
  },

  // Image optimisation
  // gulp-imagemin
  imageminOptions: [
    require('gulp-imagemin').gifsicle({interlaced: false}), // the default
    require('gulp-imagemin').svgo({removeViewBox: false})
  ],
  // gulp-imageoptim
  imageoptimOptions: {
    status: true,
    batchSize: 100,
    jpegmini: true
  },


  //
  // PostCSS plugins and their options
  // For dev
  processors: [
    require('postcss-import')(),
    require('postcss-normalize')({forceImport: true}),
    require('postcss-cssnext')(),
    require('colorguard')({threshold: ['3']}),
    require('postcss-wcag-contrast')({compliance: 'AA'}),
    require('postcss-zindex')(),
    require('css-mqpacker')(),
    require('postcss-reporter')()
  ],
  // For stage and live
  minProcessors: [
    require('postcss-import')(),
    require('postcss-normalize')({forceImport: true}),
    require('postcss-cssnext')(),
    require('postcss-zindex')(),
    require('css-mqpacker')(),
    require('cssnano')(),
    require('postcss-reporter')()
  ],


  //
  // Javascript
  // Use config/eslint.json to configure javascript linting


  //
  // HTML
  // Linting with gulp-htmltidy
  htmltidyOptions: {
    doctype: 'html5',
    hideComments: true,
    indent: true,
    indentSpaces: 2
  },
  // Minification with gulp-htmlmin
  htmlminOptions: {
    collapseWhitespace: true,
    conservativeCollapse: true,
    preserveLineBreaks: true
  },


  //
  // Rsync Deploy via rsyncwrapper

  // Rsync option explanations
  // -r recursive
  // -t preserve modification times
  // -o preserve owner
  // -v verbose
  // -z compress during transfer
  // --chmod=ugo=rwX use destination default permissions

  // --delete with --delete-excluded
  //   Deletes objects in dest that aren't present in src or are specifically
  //   excluded. Prevents orphan files server side.

  // src folder should have trailing slash
  // dest folder shouldn't have trailing slash when syncing entire folders

  // Stage
  stageRsyncOptions: {
    ssh: true,
    src: './hugo/published/stage/',
    dest: 'you@example.com:/var/www/sitename-stage',
    args: ['-rtozv', '--chmod=ugo=rwX', '--delete', '--delete-excluded'],
    exclude: ['.git*', 'cache', 'logs', '.DS_Store']
  },

  // Live
  liveRsyncOptions: {
    ssh: true,
    src: './hugo/published/live/',
    dest: 'you@example.com:/var/www/sitename',
    args: ['-rtozv', '--chmod=ugo=rwX', '--delete', '--delete-excluded'],
    exclude: ['.git*', 'cache', 'logs', '.DS_Store']
  }

};
