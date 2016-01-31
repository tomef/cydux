'use strict';

module.exports = {
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      },
    ],
  },
  output: {
    library: 'cydux',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['', '.js']
  },
};
