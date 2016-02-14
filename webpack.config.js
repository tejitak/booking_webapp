var webpack = require('webpack');

module.exports = {
  cache: true,

  watch: true,

  entry: {
    'app': ['./public/js/app/main.js'],
    'pc': ['./public/js/pc/main.js'],
    'sp_detail': ['./public/js/sp/detail.js'],
    'sp_preview': ['./public/js/sp/preview.js']
  },

  output: {
    filename: '[name].js'
  },

  node: {
    fs: "empty"
  },

  devtool: 'inline-source-map',

  module: {
    loaders: [
      { test: /\.vue$/, loader: "vue" },
      { test: /\.js$|\.jsx$/, exclude: /node_modules|build/, loader: 'babel'},
      { test: /\.js$/, loader: "eslint-loader", exclude: /node_modules|public\/js\/lib/}
    ]
  },

  // vue-loader config:
  // lint all JavaScript inside *.vue files with ESLint
  // make sure to adjust your .eslintrc
  vue: {
    loaders: {
      js: 'babel!eslint'
    }
  },

  plugins: [],

  resolve: {
    root: __dirname,
    alias: {
    },
    extensions: ['', '.js']
  }
};
