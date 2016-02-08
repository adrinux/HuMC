# web-starter-hugo
A static web site starter kit using Gulp and Hugo static site generator

## How to use
Eventually this project should be a Yeoman generator, in the meantime:

```
git clone
npm install
bower install
# test run with
gulp dev
```

## Features


## Documentation
You're reading it. For further info see docs for incorportated tools

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
- [gulp-newer](https://www.npmjs.com/package/gulp-newer)
- [gulp-sharp](https://www.npmjs.com/package/gulp-sharp)
- [gulp-gm](https://www.npmjs.com/package/gulp-gm)
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)
- [gulp-imageoptim](https://www.npmjs.com/package/gulp-imageoptim)
- [gulp-responsive](https://www.npmjs.com/package/gulp-responsive)

### PostCSS plugins included
- [Autoprefixer](https://www.npmjs.com/package/autoprefixer)
- [Colorguard](https://www.npmjs.com/package/colorguard)
- [PostCSS Reporter](https://www.npmjs.com/package/postcss-reporter)

## Customising the Modernizr build
The Modernizr npm module is installed locally when you run npm install. The configuration file is located in 'config/modernizr-config.json' and by default only contains the HTML5shiv and HTML5printshiv. To add detectors either hand edit this file or configure and copy/paste (or download) a new modernizr-config.json at [Modernizr.com](https://modernizr.com/download).

## Editor setup
### Linting
(Describe .eslintrc.json use with sublime text and linters)


## Someday features
Yeoman generator to generate this.
