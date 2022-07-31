const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { HotModuleReplacementPlugin } = require('webpack')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'vue.js',
        library: {
            name: 'Vue',
            type: 'umd',
            export: 'default'
        }
    },
    //mode中默认加入了devtool的属性
    mode: 'development',
    target: 'web',
    devServer: {
        hot: true,
        port: 8081,
        open: true
        // contentBase: path.resolve(__dirname, 'dist')
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: './index2.html',
            scriptLoading: 'blocking'
        })
    ]
}
