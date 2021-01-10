import {JWK, JWT} from "@solid/jose";

const DEFAULT_MAX_AGE = 3600  // Default token expiration, in seconds

export class PoPToken extends JWT {

    constructor(a,b) {
        super(a,b);
    }

    static issueFor(resourceServerUri, session) {
        if (!resourceServerUri) {
            throw new Error('Cannot issue PoPToken - missing resource server URI')
        }

        if (!session.sessionKey) {
            throw new Error('Cannot issue PoPToken - missing session key')
        }

        if (!session.authorization.id_token) {
            throw new Error('Cannot issue PoPToken - missing id token')
        }

        let jwk = JSON.parse(session.sessionKey)

        return JWK.importKey(jwk)
            .then(importedSessionJwk => {
                let options = {
                    aud: (new URL(resourceServerUri)).origin,
                    key: importedSessionJwk,
                    iss: session.authorization.client_id,
                    id_token: session.authorization.id_token
                }

                return PoPToken.issue(options)
            })
            .then(jwt => {
                return jwt.encode()
            })
    }

    /**
     * issue
     *
     * @param options {Object}
     * @param options.iss {string} Token issuer (RP client_id)
     * @param options.aud {string|Array<string>} Audience for the token
     *   (such as the Resource Server url)
     * @param options.key {JWK} Proof of Possession (private) signing key, see
     *   https://tools.ietf.org/html/rfc7800#section-3.1
     *
     * @param options.id_token {string} JWT compact encoded ID Token
     *
     * Optional:
     * @param [options.iat] {number} Issued at timestamp (in seconds)
     * @param [options.max] {number} Max token lifetime in seconds
     *
     * @returns {PoPToken} Proof of Possession Token (JWT instance)
     */
    static issue(options) {
        let {aud, iss, key} = options

        let alg = key.alg
        let iat = options.iat || Math.floor(Date.now() / 1000)
        let max = options.max || DEFAULT_MAX_AGE

        let exp = iat + max  // token expiration

        let header = {alg}
        let payload = {iss, aud, exp, iat, id_token: options.id_token, token_type: 'pop'}

        return new PoPToken({header, payload, key: key.cryptoKey}, {filter: false})
    }
}