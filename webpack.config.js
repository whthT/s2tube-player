const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const createMinifier = require('css-loader-minify-class')
const TerserPlugin = require('terser-webpack-plugin')
const dev = process.env.NODE_ENV === 'dev'
const cssModulesOptions = {
  modules: {
    localIdentName: '[local]--[hash:base64:3]'
  },
  importLoaders: true
}

if (!dev) {
  cssModulesOptions.modules.getLocalIdent = createMinifier({
    prefix: 's2tp_'
  })
}

const options = {
  entry: [
    'core-js/stable',
    path.join(__dirname, `src/${dev ? 'index.js' : 'S2TubePlayer/index.ts'}`)
  ],
  mode: dev ? 'development' : 'production',
  devtool: dev ? 'inline-source-map' : 'none',
  output: {
    library: 'S2TubePlayer',
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: path.resolve(__dirname, './dist'),
    filename: 'S2TubePlayer.js'
  },
  devServer: {
    contentBase: [path.join(__dirname, 'dist'), path.join(__dirname, 'public')],
    compress: true,
    port: 9000,
    writeToDisk: true
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
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader']
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'S2TubePlayer.css'
    })
  ],
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

if (!dev) {
  options.optimization = {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  }
}

module.exports = options
