const path = require('path');
const { EsbuildPlugin } = require('esbuild-loader');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

// true: html 入口模式
// false: entry 入口模式
const htmlBundler = true;

const config = {
  entry: htmlBundler
    ? {}
    : {
        app: ['./src/js/app.js', './src/css/app.css'],
      },
  output: {
    path: path.resolve('dist'),
    filename: htmlBundler ? '[name].[chunkhash:4].js' : 'js/[name].js',
    chunkFilename: htmlBundler ? '[name].[chunkhash:4].js' : 'js/[name].[chunkhash:4].js',
    clean: true, // clean the 'dist' directory before build
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: { target: 'es2015' },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          !htmlBundler && MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false } },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, './postcss.config.js'),
              },
            },
          },
        ],
      },
      {
        test: /\.(ico|png|jp?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash:4][ext]',
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // must be the same as output.path
    },
    watchFiles: {
      paths: ['src/**/*.*'],
    },
    compress: true,
    port: 8888,
  },
  watchOptions: {
    aggregateTimeout: 200,
  },
  plugins: [
    htmlBundler
      ? new HtmlBundlerPlugin({
          // Documentation: https://github.com/webdiscus/html-bundler-webpack-plugin
          entry: {
            index: 'src/index.html', // => dist/index.html (key is output filename w/o '.html')
          },
          js: {
            filename: 'js/[name].[contenthash:4].js',
            inline: !production, // inline JS for production mode, extract JS file for development mode
          },
          css: {
            filename: 'css/[name].[contenthash:4].css',
            inline: !production, // inline CSS for production mode, extract CSS file for development mode
          },
          minify: 'auto',
        })
      : new MiniCssExtractPlugin({
          filename: 'css/[name].css',
        }),
    !htmlBundler &&
      new CopyPlugin({
        patterns: [{ from: path.resolve(__dirname, 'src/index.html'), to: path.resolve(__dirname, 'dist/index.html') }],
      }),
  ],
  mode: production ? 'production' : 'development',
  stats: production ? 'normal' : 'minimal',
};

if (production) {
  config.optimization = {
    minimize: production,
    minimizer: [
      new EsbuildPlugin({
        target: 'es2015',
        css: true,
      }),
    ],
  };
}

module.exports = config;
