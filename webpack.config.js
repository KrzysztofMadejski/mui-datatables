const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: "./examples/Router/index.js"
  },
  mode: 'development',
  stats: "verbose",
  context: __dirname,
  output: {
    filename: 'bundle.js'
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
  devtool: 'source-map',
  devServer: {
    disableHostCheck: true,
    hot: true,
    inline: true,
    host: "0.0.0.0",
    port: 5050
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /(node_modules)/,
        use: [
          'awesome-typescript-loader',
          'eslint-loader'
        ]
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify("development"),
      }
    })
  ]
};
