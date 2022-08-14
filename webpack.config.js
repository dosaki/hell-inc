const path = require('path');

module.exports = {
  entry: './src/game.js',
  output: {
    path: path.resolve(__dirname, 'app', 'js'),
    filename: 'game.js'
  },
  devtool: 'source-map',
  resolve: {
    fallback: {
      "crypto": false
    }
  }
};