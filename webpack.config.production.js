'use strict';

const webpack = require('webpack');
const base = require('./webpack.config.base.js');

let productionConfig = Object.create(base);

productionConfig.plugins = [
  new webpack.DefinePlugin({
    'process.env': {NODE_ENV: '"production"'}
  }),
];

module.exports = productionConfig;
