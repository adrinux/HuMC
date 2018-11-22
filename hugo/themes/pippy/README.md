# Pippy

A Hugo theme based on H5bp and including hugo pipes support

## Dependencies

### PostCSS

Install the following node modules with npm:

- postcss-cli
- postcss-import
- postcss-preset-env
- autoprefixer
- postcss-reporter

You might want to install them all locally to your project, installing globally reduces duplication if you use pippy as a base theme in more than one project. The following is a working compromise. Run the second command inside 'pippy' directory (or whatever name you cloned it to). Or run 'npm install' there instead.

``` bash
npm install -g postcss-cli
npm install -D postcss-preset-env postcss-reporter postcss-import autoprefixer
```

## Params

### Google Analytics

The GA code block from H5BP is in a hugo partial. It will be included when you define a variable 'GoogleAnalytics' containing your Google Analytics site ID.
eg inside config.toml
``` toml
[Params]
  GoogleAnalytics = "YOUR-GA-SITE-ID"
```
