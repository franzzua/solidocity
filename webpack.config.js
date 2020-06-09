const webpack = require('webpack')
module.exports = {
    externals: ['solid-auth-cli', 'websocket', '@trust/webcrypto'],
    resolve: {
        alias: {
            '@sinonjs/text-encoding$': `${__dirname}/polyfills/text-encoder.js`,
            'text-encoding$': `${__dirname}/polyfills/text-encoder.js`,
            'whatwg-url$': `${__dirname}/polyfills/whatwg-url.js`,
            'solid-auth-client$': `${__dirname}/dist/esm/impl/fetch.js`,
            'solid-auth-cli$': `${__dirname}/dist/esm/impl/fetch.js`,
            'node-fetch$': `${__dirname}/dist/esm/impl/fetch.js`,
        }
    },
    node: {
        global: true,
        stream: true
    },
    plugins: [
        new webpack.DefinePlugin({
            global: 'self'
        })
    ]
}