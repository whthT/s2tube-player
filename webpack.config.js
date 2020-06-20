const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const createMinifier = require('css-loader-minify-class')
const dev = process.env.NODE_ENV === 'dev'
const cssModulesOptions = {
  modules: {
    localIdentName: '[local]--[hash:base64:3]'
  },
  importLoaders: true
}

if (!dev) {
  cssModulesOptions.modules.getLocalIdent = createMinifier({
    prefix: '_'
  })
}

const options = {
  entry: path.join(__dirname, 'src/index.js'),
  mode: dev ? 'development' : 'production',
  devtool: 'inline-source-map',
  output: {
    library: 'S2TubePlayer',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist'),
    filename: 'S2TubePlayer.js'
  },
  devServer: {
    contentBase: [path.join(__dirname, 'dist'), path.join(__dirname, 'public')],
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: cssModulesOptions
          },
          'sass-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin()],
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
}

if (dev) {
  options.plugins.push(
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/template.html'),
      title: 'S2TubePlayer'
    })
  )
}

module.exports = options
