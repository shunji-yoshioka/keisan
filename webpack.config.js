const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const preloadConfig = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/preload.ts',
    target: 'electron-preload',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'preload.js'
    }
};

const rendererConfig = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/renderer.tsx',
    target: 'web',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(mp3|wav)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'sounds/[name][ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'renderer.js',
        library: 'RendererApp',
        libraryTarget: 'var'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html'
        })
    ]
};

module.exports = [preloadConfig, rendererConfig]; 