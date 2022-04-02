/**
 * require
 *
 * nodejs で modules をインポートする際に用いられる。
 */
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),

    // Webpack serve に必須
    publicPath: '/dist',
  },
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
        publicPath: '/dist',
      },
      {
        directory: __dirname,
        publicPath: '/',
      },
    ],
    open: {
      app: {
        name: 'Google Chrome',
        // arguments: ["--incognito", "--new-window"],
      },
    },
    port: 9999,
    hot: true,
    watchFiles: ['index.html'],
  },
  devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
