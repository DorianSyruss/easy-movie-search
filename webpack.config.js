/**
 * Created by engine on 22/02/2017.
 */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    'bootstrap-loader',
    './index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: './dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: 'node_modules'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader' , 'sass-loader']
      },
      {
        test:/bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/,
        use: 'imports-loader?jQuery=jquery'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(woff2?|svg)$/,
        loader: 'url-loader',
        query: {
          limit: 10000
        }
      },
      {
        test: /\.(ttf|eot)$/,
        use: 'file-loader'
      },
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: 'assets',
      to: 'assets'
    }]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    })
  ]
};

