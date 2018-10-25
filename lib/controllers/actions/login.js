'use strict';
var bcrypt = require('bcrypt');
var _ = require('lodash');
var wla = require('../../waterlock-local-auth');
var authConfig = wla.authConfig;

/**
 * Login action
 */
module.exports = async (req, res) =>{

    var scope = wla.scope(waterlock.Auth, waterlock.engine);
    var params = req.allParams();

    if (typeof params[scope.type] === 'undefined' || typeof params.password !== 'string') {
        waterlock.cycle.loginFailure(req, res, null, { error: 'Invalid ' + scope.type + ' or password' });
    } else {
        var pass = params.password;
        try {
            let user = await scope.getUserAuthObject(params, req);
        
            if (user) {
                var srcProvider = params.type || params.provider || authConfig.providerName || wla.authType || 'local';
                var foundAuth = _.find(user.auths, function (o) {
                    return o.provider === srcProvider;
                });

                if (foundAuth && bcrypt.compareSync(pass, foundAuth.password)) {
                    return waterlock.cycle.loginSuccess(req, res, user);
                }
                else {
                    return waterlock.cycle.loginFailure(req, res, user, {
                        error: 'Invalid ' + scope.type + ' or password'
                    });
                }
            } else {
                //TODO redirect to register
                return waterlock.cycle.loginFailure(req, res, null, { error: 'user not found' });
            }
        } catch (err) {
            if (err) {
                if (err.code === 'E_VALIDATION') {
                    return res.status(400).json(err);
                } else {
                    return res.serverError(err);
                }
            }
        }
        
    }
};
