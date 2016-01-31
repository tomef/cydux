'use strict';

const webpack = require('webpack');
const base = require('./webpack.config.base.js');

let developmentConfig = Object.create(base);

developmentConfig.plugins = [
  new webpack.DefinePlugin({
    'process.env': {NODE_ENV: '"development"'}
  }),
]

module.exports = developmentConfig;
