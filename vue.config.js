const { defineConfig } = require('@vue/cli-service')
const VUE_APP_BASE_API = '^' + process.env.VUE_APP_BASE_API;
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
let cesiumSource = './node_modules/cesium/Source'
let cesiumWorkers = '../Build/Cesium/Workers'
module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: "./",
    lintOnSave: false,
    productionSourceMap: false,
    configureWebpack() {
        return {
            plugins: [
                new CopyWebpackPlugin({
                    patterns: [
                        { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                        { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                        { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
                        { from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers' },
                    ],
                }),

                new webpack.DefinePlugin({
                    CESIUM_BASE_URL: JSON.stringify('./')
                })
            ],
            resolve: {
                fallback: {
                    https: require.resolve("https-browserify"),
                    http: require.resolve("stream-http"),
                    zlib: require.resolve("browserify-zlib"),
                    url: require.resolve("url/"),
                    assert: require.resolve("assert/"),
                    stream: require.resolve("stream-browserify")
                },
            },
        }
    },

})