'use strict';
var _ = require('lodash');
var wla = require('./waterlock-local-auth');
var authConfig = wla.authConfig;
var uuid = require('uuid');
/**
 * TODO these can be refactored later
 * @type {Object}
 */

module.exports = function (Auth, engine) {
    var def = Auth.rawAttributes;
	if(authConfig.useUserName && !_.isUndefined(def.username))
	{
		return generateScope('username', engine);
	}
	else if(!_.isUndefined(def.email))
	{
		return generateScope('email', engine);
	}
	else {
        var error = new Error('Auth model must have either an email or username attribute');
        throw error;
    }
};

function generateScope(scopeKey, engine) {
    return {
        type: scopeKey,
        engine: engine,

        registerUserAuthObject: async (attributes, req, mapUserCriteria,userdefaults) =>{
            //var self = this;
            var attr = {
                password: attributes.password,
                provider: attributes.type || attributes.provider || authConfig.providerName || wla.authType || 'local'
            };
            if (authConfig.useUserName) {
                attr["email"] = attributes["email"] || attributes["EMAIL"];//set email field since it required. username used just for login
                attr["emailConfirmed"] = attributes["emailConfirmed"] || true;
            }
            attr[scopeKey] = attributes[scopeKey];

            var criteria = {};
            criteria[scopeKey] = attr[scopeKey];

            mapUserCriteria = mapUserCriteria || {uid:null};
            userdefaults = userdefaults || {uid: uuid.v4()}
            return await engine.findOrCreateAuth(criteria, attr, mapUserCriteria,userdefaults);

            // this.engine.findAuth(criteria, function (err, user) {
            //     if (user) {
            //         return cb(err, user);
            //     }
            //     mapUserCriteria = mapUserCriteria || {uid:null};
            //     userdefaults = userdefaults || {uid: uuid.v4()}
            //     self.engine.findOrCreateAuth(criteria, attr, cb,mapUserCriteria,userdefaults);
            // });
        },

        getUserAuthObject: async (attributes, req) => {
            var attr = {
                password: attributes.password,
                provider: attributes.type || attributes.provider || authConfig.providerName || wla.authType || 'local'
            };
            attr[scopeKey] = attributes[scopeKey];

            var criteria = {};
            criteria[scopeKey] = attr[scopeKey];

            if (authConfig.createOnNotFound) {
                return await engine.findOrCreateAuth(criteria, attr);
            } else {
                return await engine.findAuth(criteria);
            }
        }
    };
}
