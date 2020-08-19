const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'index.ts'),
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: 'html-midi-player.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  externals: {
    '@magenta/music/es6/core': 'core',
    '@magenta/music/es6/protobuf': 'protobuf'
  }
};
