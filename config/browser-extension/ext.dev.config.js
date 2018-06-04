const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CreateFileWebpack = require('create-file-webpack');

const common = require('./ext.base.config');

module.exports = (env, argv) => merge(common.config(env, argv), {
  output: {
    // TODO dynamic publicPath loading
    publicPath: 'chrome-extension://hhjfhkdpnajfnekdaigmpahnnoccfaio/',
  },
});

