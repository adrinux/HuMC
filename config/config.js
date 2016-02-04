'use strict';

//
// Configuration variables that we're likely to modify are in this file

module.exports = {

  //
  // Hugo is happiest with a 'baseurl' set. Normally in Hugo's
  // config.[toml,yaml,json] but we set it dynamically so we can use different
  // values for dev, stage and production runs.
  // See Hugo docs: https://gohugo.io/overview/configuration/
  // Change Stage and Base Urls to the domains you're using
  hugoBaseUrl: {
    stage: 'http://stage.example.com',
    live: 'http://example.com',
    dev: 'http://localhost:3000'
  },


  //
  // Image processing
  // Using sharp to do simple edits
  sharpOptions: {
    resize : [1280, 1140],
    max : false,
    withoutEnlargement: true,
    quality : 86,
    progressive : false
  },

  // Optionally rename images processed with sharp
  // Uncomment the rename line in the gulpfile.js 'sharp' task before use
  // For options see https://github.com/hparra/gulp-rename#notes
  sharpRename: {
    suffix: '-sharp'
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
    withoutEnlargement: true
  },

  // Image optimisation
  // gulp-imagemin
  imageminOptions: {
    progressive: false,
    svgoPlugins: [{removeViewBox: false}]
  },
  // gulp-imageoptim
  imageoptimOptions: {
    status: true,
    batchSize: 100
  },


  //
  // SASS
  sassPaths: {
    src: 'src/sass/main.scss',
    dest: 'hugo/static/styles/'
  },

  // PostCSS plugins and their options
  // For dev
  processors: [
    require('colorguard')({threshold: ['3']}),
    require('autoprefixer')({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
    require('postcss-reporter')()
  ],
  // For stage and live
  minProcessors: [
    require('autoprefixer')({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
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
  }

};
