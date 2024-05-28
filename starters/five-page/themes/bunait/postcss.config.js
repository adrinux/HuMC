
module.exports = {
  plugins: [
    require('postcss-preset-env')({
      /* use stage 2 rules */
      stage: 2,
      preserve: false
    }),
    require('autoprefixer'),
    require('postcss-reporter')
  ]
};

