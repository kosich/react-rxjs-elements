const path = require('path');
const webpackRxjsExternals = require('./webpack-rxjs-externals');


module.exports = {
    entry: './src/index.ts',
    output: {
        library: 'react-rxjs-elements',
        libraryTarget: 'umd',
        publicPath: '/dist/',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'configs/tsconfig.esm.json'
                        }

                    }
                ]
            },
        ]
    },
    resolve: {
        extensions: ['.ts']
    },
    externals: [
        {
            react: 'react'
        },
        webpackRxjsExternals()
    ]
};
