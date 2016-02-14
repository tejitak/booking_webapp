var Activity = Parse.Object.extend("Activity");

var createMyACL = function(userId) {
  var acl = {};
  acl["*"] = {"read": true};
  acl["role:admin"] = {"read": true, "write": true};
  acl[userId] = {"read": true, "write": true};
  return acl;
};

var assignACLTrigger = function(request, response) {
  // allow master
  if (request.master) {
    return response.success();
  }
  // user must be authenticated
  if (request.user) {
    // Request to update existing row. Let it proceed.
    // The PUT request will cause error by ACL if the user is invalid
    if (!request.object.isNew()) {
      return response.success();
    }
    // set ACL for POST request
    request.object.set('ACL', createMyACL(request.user.id));
    response.success();
  } else {
    return response.error("Not logged in.");
  }
}

var assignRoleTrigger = function(request) {
  // set 'user' role for the new user
  var roleQuery = new Parse.Query(Parse.Role)
  roleQuery.equalTo('name', 'user')
  roleQuery.first({useMasterKey: true}).then(function(role) {
    role.getUsers().add(request.user)
    return role.save(null, {useMasterKey: true})
  }, function(err) {
    console.log(err)
  })
}

var initActivity = function() {
  // modify POST request with ACL
  Parse.Cloud.beforeSave(Activity, assignACLTrigger);
  Parse.Cloud.afterSave(Parse.User, assignRoleTrigger);
};

module.exports = {
  init: function() {
    initActivity()
  }
};