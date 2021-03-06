'use strict';

var _ = require('lodash');
var wla = require('../waterlock-local-auth');
var authConfig = wla.authConfig;

exports.attributes = function (attr) {
  var template = {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      // validate: {
			// 	isEmail: true
			// }
    },
    username: {
      type: Sequelize.STRING,
      validate: {
        min: 4
      }
      //unique: true,
    },
    password: {
      type: Sequelize.STRING,
      // validate: {
      //   min: 8
      // }
    },
    // resetToken: {
    //   model: 'resetToken'
    // }
  };
  if (authConfig.useUserName) {
    template.username.allowNull = false;
    if (!_.isUndefined(template.email.allowNull)) {
      delete template.email.allowNull;
    }
  }
  else if (!_.isUndefined(template.username.allowNull)) {
    delete template.username.allowNull;
  }
  _.merge(template, attr);
  _.merge(attr, template);
};


/**
 * model associations
 */
exports.associations = function () {
	var _ = require('lodash');
  waterlock.Auth.belongsTo(waterlock.User, {as: 'user',foreignKey: 'auth_uid'});
  waterlock.Auth.hasOne(waterlock.ResetToken, {as: 'resetToken'});
  };
  
  /**
   *  model options
   * @param  {obejct} options user defined options
   * @return {object} options merged with template and method model object
   */
  exports.options = function (options) {
  var _ = require('lodash');
  var template = {
	  tableName: 'auth',
	  indexes: [
		  {
			  unique:true,
		  	fields:['email']
		  }
	  ]
	};
  if (authConfig.useUserName) {
     template = {
      tableName: 'auth',
      indexes: [
        {
          unique:true,
          fields:['username']
        }
      ]
    };
  }
	
  
	return _.merge(template, options);
  
  };

/**
 * used to hash the password
 * @param  {object}   values
 * @param  {Function} cb
 */
exports.beforeCreate = function (values) {
  if (!_.isUndefined(values.password)) {
    var bcrypt = require('bcrypt');
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(values.password, salt);
    values.password = hash;
  }
};

/**
 * used to update the password hash if user is trying to update password
 * @param  {object}   values
 * @param  {Function} cb
 */
exports.beforeUpdate = function (values) {
  if (!_.isUndefined(values.password) && values.password !== null) {
    var bcrypt = require('bcrypt');
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(values.password, salt);
    values.password = hash;
  }
};
