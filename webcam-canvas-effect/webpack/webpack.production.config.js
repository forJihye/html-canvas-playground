const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const pathResolve = (...v) => path.resolve(__dirname, '..', ...v);
const {name, version} = require(pathResolve('package.json'));
const jsconfig = require(pathResolve('jsconfig'));
const paths = jsconfig.compilerOptions.paths;

module.exports = {
  mode: 'production',
  entry:  pathResolve('webpack/entry.js'), // If webpack-hot-middleware isn't exist, HMR will not work.
  output: {
    path: pathResolve('dist'),
    publicPath: './',
    filename: '[name].[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
            },
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!(@hashsnap)\/).*/,
        use: {
          loader: 'babel-loader'
        },
      },
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'assets/[hash].[ext]'
            },
          },
        ],
      },
      {
        test: /\.html\.hamlc?$/,
        loader: 'haml-loader'
      }
    ],
  },
  devtool: false,
  target: 'web',
  plugins: [
    new CleanWebpackPlugin({ default: ['dist'] }),
    new HtmlWebpackPlugin({ template: 'public/index.html' }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
    new webpack.ProvidePlugin({
      $: [pathResolve('providers/query-selector.js'), '$'],
      $$: [pathResolve('providers/query-selector.js'), '$$'],
      isDev: [pathResolve('providers/is-dev.js'), 'default'],
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts'],
    alias: Object
      .keys(paths)
      .filter(key => key.slice(-1) === '*')
      .reduce((acc, key) => Object.assign(acc, {[key.slice(0, -2)]: pathResolve(paths[key][0].slice(0, -2))}), {})
    ,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {drop_console: true}, // removed comments also.
        }
      }),
      new OptimizeCssAssetsPlugin({}),
    ],
  },
};
