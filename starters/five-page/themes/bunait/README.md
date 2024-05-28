# Bunait

A Hugo theme based on [HTML5 Boilerplate](https://html5boilerplate.com/).

## Dependencies

### PostCSS

Install the following node modules with npm:

- [postcss-cli](https://github.com/postcss/postcss-cli)
- postcss-import
- [postcss-preset-env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme)
- postcss-reporter

You might want to install them all locally to your project, installing globally reduces duplication if you use Bunait as a base theme in more than one project. The following is a working compromise. Run the second command inside `bunait` directory (or whatever name you cloned it to). Or run `npm install` there instead.

``` bash
npm install -g postcss-cli
npm install -D postcss-preset-env postcss-reporter postcss-import autoprefixer
```
