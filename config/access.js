

exports.accessCheck = function(check){
var access = {};
// adjust this to change default action. 1 for everyone to login, even to read. 2 to allow for read only for anyone.
if(!check){
    check = {};
    check.access = 2;
    }
if(check.access > 4){access.root = 1;}
if(check.access > 3){access.delete = 1;}
if(check.access > 2){access.edit = 1;}
if(check.access > 1){access.read = 1;}
if(check.access === 1){access.noAccess = 1;}
return access;
};



/*
In var of handlers
accConfig = require('../config/access'),

Root Level
if (accConfig.accessCheck(req.user).root !== 1){

Delete level
 if (accConfig.accessCheck(req.user).delete !== 1){

Edit level
 if (accConfig.accessCheck(req.user).edit !== 1) 

Read level
 if (accConfig.accessCheck(req.user).read !== 1){

*/