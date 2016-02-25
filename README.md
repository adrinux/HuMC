# web-starter-hugo
A static web site starter kit using gulp and Hugo static site generator. Uses gulp to process images, javascript, css and html into a containted Hugo site and runs Hugo to process it all.

## Features
- Includes seperate dev, stage and live flows.
- Includes browsersync for live sync during development.
- Has hugo templates based on [HTML5 boilerplate](https://html5boilerplate.com/).
- Includes a custom and modifiable build of modernizr 
- Includes normalize.css and the base H5BP CSS with some colours moved to variables.
- Uses PostCSS for CSS processing.

## How to use
Eventually this project should be a Yeoman/Slush generator, in the meantime:

```
git clone
npm install
# test run with
gulp dev
```
You may need to edit some variables in config/config.js before "gulp dev" will function properly.

Currently image processing tasks need to be run manually, be sure to run them after adding new images or changing image processing configuration.

### Gulp tasks
Process images: "gulp reprocess"
Process responsive images: "gulp reprocess:responsive"
To develop with live sync: "gulp"
To do a development run without live sync "gulp dev"
For a staging site run: "gulp stage"
For a live/production site run: "gulp live" 
To deploy to staging with rsync (configure first): "gulp upstage"
To deploy to live with rsync (configure first): "gulp golive"

## Documentation
You're reading it. For further info see docs for incorportated tools:

- [Gulp](https://github.com/gulpjs/gulp/tree/master/docs)
- [Hugo](https://gohugo.io/overview/introduction/)

### npm modules included
- [del](https://www.npmjs.com/package/del)
- [lazypipe](https://www.npmjs.com/package/lazypipe)
- [babel-core and related(see package.json)](https://github.com/babel/babel/tree/master/packages/babel-core)
- [modernizr](https://www.npmjs.com/package/modernizr)
- [main-bower-files](https://www.npmjs.com/package/main-bower-files)
- [browser-sync](https://www.npmjs.com/package/browser-sync)
- [rsyncwrapper](https://www.npmjs.com/package/rsyncwrapper)

### Gulp plugins included
- [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins)
- [gulp-concat](https://www.npmjs.com/package/gulp-concat)
- [gulp-sass](https://www.npmjs.com/package/gulp-sass)
- [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps)
- [gulp-postcss](https://www.npmjs.com/package/gulp-postcss)
- [gulp-eslint](https://www.npmjs.com/package/gulp-eslint)
- [gulp-uglify](https://www.npmjs.com/package/gulp-uglify)
- [gulp-rename](https://www.npmjs.com/package/gulp-rename)
- [gulp-util](https://www.npmjs.com/package/gulp-util)
- [gulp-filter](https://www.npmjs.com/package/gulp-filter)
- [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin)
- [gulp-sharp](https://www.npmjs.com/package/gulp-sharp)
- [gulp-gm](https://www.npmjs.com/package/gulp-gm)
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)
- [gulp-imageoptim](https://www.npmjs.com/package/gulp-imageoptim)
- [gulp-responsive](https://www.npmjs.com/package/gulp-responsive)

### PostCSS plugins included
- [postcss-import](https://github.com/postcss/postcss-import)
- [PostCSS cssnext](http://cssnext.io/)
- [Colorguard](https://www.npmjs.com/package/colorguard)
- [postcss-zindex](https://www.npmjs.com/package/postcss-zindex)
- [css-mqpacker](https://www.npmjs.com/package/css-mqpacker)
- [PostCSS Reporter](https://www.npmjs.com/package/postcss-reporter)

A good comparison of PostCSS plugin packs is available [https://github.com/timaschew/postcss-compare-packs](https://github.com/timaschew/postcss-compare-packs)

## Customising the Modernizr build
The Modernizr npm module is installed locally when you run npm install. The configuration file is located in 'config/modernizr-config.json' and by default only contains the HTML5shiv and HTML5printshiv. To add detectors either hand edit this file or configure and copy/paste (or download) a new modernizr-config.json at [Modernizr.com](https://modernizr.com/download).

## Editor setup
### Linting
The file .eslintrc.json is set up for use with the Sumblime Text 3 linter for eslint. For configuration of eslint when linting you projects javascript see config/eslint.json

.stylelintrc is also currently setup for use by Sumblime Text 3 linter for stylelint, and not used by the gulp tasks.
