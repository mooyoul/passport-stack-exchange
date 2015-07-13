/**
 * Module dependencies.
 */
var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    Profile = require('./profile'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor
 */
function Strategy(options, verify) {
    'use strict';

    options = options || {};

    options.authorizationURL = options.authorizationURL || 'https://stackexchange.com/oauth';
    options.tokenURL = options.tokenURL || 'https://stackexchange.com/oauth/access_token';

    OAuth2Strategy.call(this, options, verify);
    this.name = 'stack-exchange';

    this._profileURL = options.profileURL || 'https://api.stackexchange.com/2.2/me';
    this._site = options.site || 'stackoverflow';
    if (! options.stackAppsKey) {
        throw new Error('stackAppsKey must be specified!');
    }
    this._key = options.stackAppsKey;
    this._oauth2.setAccessTokenName('access_token');
}


/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Return extra parameters to be included in the authorization request.
 */
Strategy.prototype.authorizationParams = function (options) {
    'use strict';

    // Do not modify `options` object.
    // It will hurts original options object which in `passport.authenticate(..., options)`
    var params = _.extend({}, options);
    return params;
};


/**
 * Retrieve user profile from Stack Exchange.
 */
Strategy.prototype.userProfile = function(accessToken, done) {
    'use strict';

    // We need to use `request` module
    // because all of protected resources will be compressed.
    // @see https://api.stackexchange.com/docs/compression
    request({
        method: 'GET',
        url: this._profileURL,
        // @see https://api.stackexchange.com/docs/compression
        gzip: true,
        qs: {
            /* jshint ignore:start */
            // key must be passed on every request
            key: this._key,
            site: this._site,
            access_token: accessToken
            /* jshint ignore:end */
        }
    }, function (err, res, body) {
        if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

        var json;
        try {
            json = JSON.parse(body);
        } catch (e) {
            // something went wrong during parse JSON.
            // e.g. Malformed JSON string.
            return done(new InternalOAuthError('Malformed response.', e));
        }

        if (!(json.items && json.items.length)) {
            return done(new InternalOAuthError('Empty response.'));
        }

        // compose the profile object
        var profile = Profile.parse(json.items[0]);
        profile.provider = 'stack-exchange';
        profile._raw = body;
        profile._json = json;

        done(null, profile);
    });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;