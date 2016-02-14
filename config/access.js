
// adjust this to change default action.
// all permissions are additive.
// 1 No read access without login.
// 2 Read with no login.
// 3 Edit with no login (don't do this).
// 4 Delete with no login (really don't do this)
// 5 Root whith no login (don't even talk to me if you do this)

// Read level - if (accConfig.accessCheck(req.user).read !== 1)
// Edit level - if (accConfig.accessCheck(req.user).edit !== 1)
// Delete level - if (accConfig.accessCheck(req.user).delete !== 1)
// Root Level - if (accConfig.accessCheck(req.user).root !== 1)

module.exports.accessCheck = (check) => {
var access = {};
  if (!check) {
    check = {};
    check.access = 1;
  }
  if (check.access > 4) {access.root = 1;}
  if (check.access > 3) {access.delete = 1;}
  if (check.access > 2) {access.edit = 1;}
  if (check.access > 1) {access.read = 1;}
  if (check.access === 1) {access.noAccess = 1;}
  return access;
};

module.exports.userCheck = (check) => {
  var cleanUser = {
    local: {
      phone: '',
      name: '',
      email: '',
    },
    access: 0,
    _id: null,
  };

  if (!check) {
    return null;
  }
  cleanUser = {
    local: {
      phone: check.local.phone,
      name: check.local.name,
      email: check.local.email,
    },
    access: check.access,
    _id: check._id,
  };
  return cleanUser;
};



