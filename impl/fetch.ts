const Fetch: typeof window.fetch & { fetch?: typeof window.fetch, default: typeof window.fetch }
    = async (url, options) => {
        const result = await Fetch.fetch(url, options);
        if (+result.status >= 300) {
            throw result;
        }
        return result;
    };

Fetch.default = Fetch;
global.fetch = Fetch;
module.exports = Fetch;