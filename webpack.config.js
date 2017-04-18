const path = require('path');

module.exports = {
  context: __dirname + "/client",
  entry: "./wrapper.js",
  output: {
    path: __dirname + "/build",
    filename: "fivetwelve-client.js"
  },
  devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules', path.resolve('./lib')]
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules\/(?!fivetwelve.*)/,
      loader: 'babel-loader',
      options: {
        plugins: [],
        presets: [['env', {targets: {chrome: 54}}]]
      }
    }]
  }
};