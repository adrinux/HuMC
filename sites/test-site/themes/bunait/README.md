# Bunait

A Hugo theme based on H5bp and including hugo pipes support

## Dependencies

### PostCSS

Install the following node modules with npm:

- postcss-cli
- postcss-import
- postcss-preset-env
- autoprefixer
- postcss-reporter

You might want to install them all locally to your project, installing globally reduces duplication if you use bunait as a base theme in more than one project. The following is a working compromise. Run the second command inside 'bunait' directory (or whatever name you cloned it to). Or run 'npm install' there instead.

``` bash
npm install -g postcss-cli
npm install -D postcss-preset-env postcss-reporter postcss-import autoprefixer
```

## Params

### Google Analytics

Hugo has a built in GA partial. It's included in the page head when you define a variable 'googleAnalytics' containing your Google Analytics property ID.
eg inside config.toml
``` toml
googleAnalytics = "YOUR-GA-Property-ID"
```
