'use strict'
var Parse = require('node-parse-api').Parse;
var __ = require('underscore')
 
module.exports = {

  _app: null,

  setup(options) {
    this._app = new Parse(options);
  },

  find(className, query, callback) {
    return this._app.find(className, query, callback)
  },

  findWithObjectId(className, objectId, callback) {
    return this._app.findWithObjectId(className, objectId, callback)
  },

  run(functionName, options, data, callback) {
    options = options || {}
    var sessionToken = options.sessionToken
    this._parseRequestWithSessionToken('POST', '/1/functions/' + functionName, data, callback, null, sessionToken);
  },

  me(sessionToken, callback) {
    this._parseRequestWithSessionToken('GET', '/1/users/me', null, callback, null, sessionToken);
  },

  updateUser(objectId, data, sessionToken, callback) {
    this._parseRequestWithSessionToken('PUT', '/1/users/' + objectId, data, callback, null, sessionToken);
  },

  saveUser(findKey, user) {
    return new Promise((resolve, reject) => {
      // findKey is to find by sns id such as {where: {facebook_id: user.facebook_id}}
      var query = {where: {}}
      query.where[findKey] = user[findKey]
      this._app.findUser(query, (err, data) => {
        var isExistingUser = data && data.results && data.results[0]
        if (isExistingUser) {
          // for existing user, just update authData
          this._app.insertUser({authData: user.authData}, (err, data) => {
            if (err) {
              console.log('Updating AddRelation user to Parse is failed: ' + JSON.stringify(err))
            }
            resolve(data.sessionToken)
          })
        } else {
          // for new user, assign user role
          this._app.insertUser(user, (err, data) => {
            if (err) {
              console.log('inserting a new user is failed: ' + JSON.stringify(err))
            }
            resolve(data.sessionToken)
          })
        }
      })
    })
  },

  linkUser(sessionToken, authData) {
    return new Promise((resolve, reject) => {
      // retrieve me by sessionToken
      this.me(sessionToken, (err, data) => {
        if (err) {
          // no user exists for the sessionToken
          reject()
          return
        }
        this.updateUser(data.objectId, {authData: authData}, sessionToken, (e, res)=> {
          if (e) {
            console.log('fail to link the user: ' + data.objectId + ", " + JSON.stringify(e))
          }
          resolve(data.sessionToken)
        })
      })
    })
  },

  // override: modify sessionToken handling
  _parseRequestWithSessionToken(method, path, data, callback, contentType, sessionToken) {
      var headers = {
        Connection: 'Keep-alive'
      };
      if (sessionToken) {
        headers['X-Parse-Application-Id'] = this._app._options.app_id;
        headers['X-Parse-REST-API-Key'] = this._app._options.api_key;
        headers['X-Parse-Session-Token'] = sessionToken;
      } else if (this._app._options.master_key) {
        var auth = 'Basic ' + new Buffer(this._app._options.app_id + ':' + this._app._options.master_key).toString('base64');
        headers.Authorization = auth;
        if ( sessionToken ) {
            throw new Error('Can\'t use session tokens while using the master key.');
        }
      }

      var body = null;

      switch (method) {
          case 'GET':
              if (data) {
                  path += (path.indexOf("?") == -1 ? '?' : '&') + qs.stringify(data);
              }
              break;
          case 'POST':
          case 'PUT':
              body = contentType ? data : typeof data === 'object' ? JSON.stringify(data) : data;
              if ( !contentType ) {
                  headers['Content-length'] = Buffer.byteLength(body);
              }
              headers['Content-type'] = contentType || 'application/json';
              break;
          case 'DELETE':
              headers['Content-length'] = 0;
              break;
          default:
              throw new Error('Unknown method, "' + method + '"');
      }

      var options = {
          hostname: this._app._api_host,
          port: this._app._api_port,
          headers: headers,
          path: path,
          method: method
      };

      var req = this._app._api_protocol.request(options, function (res) {
          if (!callback) {
              return;
          }
          var json = '';
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
              json += chunk;
          });
          res.on('end', function () {
              var data;
              try {
                  data = JSON.parse(json);
                  if ( data.code || data.error ) {
                      throw (data);
                  }
                  callback(null, data);
              }
              catch (err) {
                  callback(err);
              }
          });
          res.on('close', function (err) {
              callback(err);
          });
      });
    
      req.setTimeout(5000, function () {
        req.connection.destroy();
      });

      body && req.write(body, contentType ? 'binary' : 'utf8');
      req.end();

      req.on('error', function (err) {
        callback && callback(err);
      });
  }

}