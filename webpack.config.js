module.exports = {
    externals: ['solid-auth-cli'],
    resolve: {
        alias: {
            '@sinonjs/text-encoding$': `${__dirname}/polyfills/text-encoder.js`,
            'text-encoding$': `${__dirname}/polyfills/text-encoder.js`,
            'whatwg-url$': `${__dirname}/polyfills/whatwg-url.js`,
            '@trust/webcrypto$': `${__dirname}/polyfills/crypto.js`,
            'solid-auth-client$': `${__dirname}/dist/esm/impl/fetch.js`,
            'solid-auth-cli$': `${__dirname}/dist/esm/impl/fetch.js`,
            'node-fetch$': `${__dirname}/dist/esm/impl/fetch.js`,
        }
    },
    node: {
        global: true,
        stream: true
    }
}