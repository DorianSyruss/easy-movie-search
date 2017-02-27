/**
 * Created by engine on 22/02/2017.
 */
const webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: './dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  },
};

