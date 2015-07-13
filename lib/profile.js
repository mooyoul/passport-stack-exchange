/**
 * Parse Profile of User
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */

var Profile = module.exports = exports = {};
Profile.parse = function parseProfile (obj) {
    'use strict';

    if (typeof obj === 'string') {
        obj = JSON.parse(obj);
    }

    var profile = {};
    /* jshint ignore:start */
    profile.id = obj.account_id;
    profile.displayName = obj.display_name;
    profile.profileUrl = obj.link;

    if (obj.profile_image) {
        profile.photos = [ obj.profile_image ];
    }
    /* jshint ignore:end */

    return profile;
};