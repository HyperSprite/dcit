const credentials = require('../credentials.js');
// See the wiki for directions under User Permissions
// for configuring the default options.

module.exports.accessCheck = (check) => {
var access = {};
  if (!check) {
    check = {};
    check.access = credentials.checkAccess;
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
