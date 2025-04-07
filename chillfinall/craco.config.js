const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    "assert": require.resolve("assert/"),
                    "buffer": require.resolve("buffer/"),
                    "stream": require.resolve("stream-browserify"),
                    "crypto": require.resolve("crypto-browserify"),
                    "process": require.resolve("process/browser"),
                }
            }
        },
        plugins: {
            add: [
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                    Buffer: ['buffer', 'Buffer'],
                }),
            ]
        }
    }
}; 