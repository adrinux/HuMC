# NOTE

Since this project started Hugo has gained the ability to optimise images, process CSS/Javascript and matches browsersync functionality. Thus much of what this project does is now obsolete.

## web-starter-hugo

A static web site starter kit using gulp and Hugo static site generator. Uses gulp to process images, javascript, css and html into a containted Hugo site and runs Hugo to process it all.

## Features

- Includes seperate dev, stage and live flows.
- Includes browsersync for live sync during development.
- Has hugo templates based on [HTML5 boilerplate](https://html5boilerplate.com/).
- Includes a custom and modifiable build of modernizr
- Includes normalize.css and the base H5BP CSS with some colours moved to variables.
- Uses PostCSS for CSS processing.

## How to use

Clone and edit per site.

```
git clone https://github.com/adrinux/web-starter-hugo.git YOUR_NEW_SITE_NAME
```
You'll want to add any changes to a project specific repo so rename the remote configured by GitHub to upstream, you can then pull in changes and bug fixes via a normal upstream workflow:
```
git remote rename origin upstream
```
You can then configure 'origin' to be your own remote repo – I'll leave the specific to you.
```
cd YOUR_NEW_SITE_NAME
npm install
```
Optionally take a look at config/config.js and configure your hugo base path and any other options you want to change.
Then try running:
```
gulp dev
```
If there are no errors you can try running with browsersync for live reload:
```
gulp
```
This should process the site and serve it using browsersync. You can now start developing the site.

Image processing tasks need to be run manually, be sure to run them after adding new images or changing image processing configuration.

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

## Customising the Modernizr build

The Modernizr npm module is installed locally when you run npm install. The configuration file is located in 'config/modernizr-config.json' and uses the H5BP defaults, edit out what you don't need. Either hand edit this file or configure and copy/paste (or download) a new modernizr-config.json at [Modernizr.com](https://modernizr.com/download).

## Editor setup

### Linting

The file .eslintrc.json is set up for use with the Sumblime Text 3 linter for eslint. For configuration of eslint when linting you projects javascript see config/eslint.json

.stylelintrc is also setup for use by Sumblime Text 3 linter for stylelint, and not used by the gulp tasks.

## Extending

H5BP has a good list of things you may want to add when coding pages:
[Extend and customise](https://github.com/h5bp/html5-boilerplate/blob/master/dist/doc/extend.md#extend-and-customise-html5-boilerplate)
