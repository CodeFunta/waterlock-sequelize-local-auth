'use strict';
var bcrypt = require('bcrypt');
var _ = require('lodash');
var wla = require('../../waterlock-local-auth');
var authConfig = wla.authConfig;
/**
 * Register action
 */
module.exports = function (req, res) {

    var scope = require('../../scope')(waterlock.Auth, waterlock.engine);
    var params = req.allParams();

    if (typeof params[scope.type] === 'undefined' || typeof params.password === 'undefined') {
        waterlock.cycle.registerFailure(req, res, null, {
            error: 'Invalid ' + scope.type + ' or password'
        });
    } else {
        var pass = params.password;

        scope.registerUserAuthObject(params, req, function (err, user) {
            if (err) {
                return res.serverError(err);
            }
            if (!user) {
                waterlock.cycle.registerFailure(req, res, user, {
                    error: 'user not found'
                });
            }
            //NOTE: not sure we need to bother with bcrypt here?
            var srcProvider = params.type || params.provider || authConfig.providerName || wla.authType || 'local';
            var foundAuth = _.find(user.auths, function (o) {
                return o.provider === srcProvider;
            });

            if (foundAuth && bcrypt.compareSync(pass, foundAuth.password)) {
                waterlock.cycle.registerSuccess(req, res, user);
            }
            else {
                waterlock.cycle.registerFailure(req, res, user, {
                    error: 'Invalid ' + scope.type + ' or password'
                });
            }
        });

    }
};
