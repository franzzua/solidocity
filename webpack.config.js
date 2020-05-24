module.exports = {
    //externals: [/text-encoding/],
    resolve: {
        alias: {
            '@sinonjs/text-encoding$': `${__dirname}/polyfills/text-encoder.js`,
            'text-encoding$': `${__dirname}/polyfills/text-encoder.js`,
            'whatwg-url$': `${__dirname}/polyfills/whatwg-url.js`,
        }
    }
}