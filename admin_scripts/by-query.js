// mongodb file
use dcit

//  might be best to have two report options, one that goes by Equipment, the other by System and make the route use those. This gets the match list down as quickly as possible
//  also, I should be able to add this new report as it is ready to the variouse types I want to run

var reqQuery = {
  system: {
    systemName: 'apache',
    //systemEnviron: 'ri5',
    systemRole: 'ui',
  },
  equip: {
    equipLocation: '_',
    //equipLocation: 'rsys-dc02',
    //equipMake: 'oracle',
  },
};


function buildRegex(rQ) {
  return Object.keys(rQ).reduce(function(previous, current) {
    previous[current] = {'$regex': rQ[current], '$options': 'i'};
    return previous;
}, {});
}; 

function buildRegex2(rQ) {
  return Object.keys(rQ).reduce(function(previous, current) {
    if(current.indexOf('system') === -1)
    previous[current] = {'$regex': rQ[current], '$options': 'i'};
    return previous;
}, {});
}; 

var sysSearch = {};
sysSearch = buildRegex(reqQuery.system);

var eqpSearch = {
  equip: {
    equip: {},
  },
};
eqpSearch.equip = buildRegex2(reqQuery.equip);
 


 print(tojson(eqpSearch));


var findThis = '_';
var inEnv = 'ri2';


    db.systemdbs.aggregate([
      {$match: sysSearch},

      {$lookup:
        { from: 'equipment',
          localField: 'systemEquipSN',
          foreignField: 'equipSN',
          as: 'equip',
        },
      },
 //     {$match: eqpSearch},

        {$match:
          { 'equip.equipLocation': { '$regex': 'rsys-dc01', '$options': 'i'},
        },
        },

        // {$match:
        //   { $or: [
        //     {'equip.equipStatus': 'In Service'},
        //     {'equip.equipStatus': 'In Service with issues'},
        //   ]},
        // },
     /*   {$match:
          { 'systemEnviron': inEnv},
        },  */
        // {$group:
        // {
        //   _id: { env: '$systemEnviron', sysEnv: '$systemEnviron', sysRole: '$systemRole'},
        //   countApp: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production App' ]}, 1, 0]}},
        //   countDb: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production DB' ]}, 1, 0]}},
        // },
        // },
        // {$sort:
        // {
        //   '_id.env': 1,
        //   'countApp': -1,
        //   'countDb': -1,
        // },
        // },
        // { $project:
        // {
        //   '_id': 0,
        //   'env': '$_id.env',
        //   'role': '$_id.sysRole',
        //   'countApp': '$countApp',
        //   'countDb': '$countDb',
        // },
        // },
        {$limit: 1},
    ]).pretty()



// this actually works
// var matchKey1 = 'systemName';
// var matchVal1 = 'apache';
// var matchKey2 = 'systemEnviron';
// var matchVal2 = 'ri5';
// match1[matchKey1] = {'$regex': matchVal1, '$options': 'i'};
// match1[matchKey2] = {'$regex': matchVal2, '$options': 'i'};



// var reqQuery = {
//   systemName: 'apache',
//   //systemEnviron: 'ri5',
//   systemRole: 'ui',
//   equip: {
//     equipLocation: 'rsys-dc01'
//   },
// };


// var sysSearch = Object.keys(reqQuery).reduce(function(previous, current) {
//     if(current.indexOf('equip') === -1)
//     previous[current] = {'$regex': reqQuery[current], '$options': 'i'};
//     return previous;
// }, {});

//  var eqpSearch = {};


// working
// var rQSys = reqQuery.system;
// //print(tojson(rQSys));

// var sysSearch = Object.keys(rQSys).reduce(function(previous, current) {
//     // if(current.indexOf('equip') === -1)
//     previous[current] = {'$regex': rQSys[current], '$options': 'i'};
//     return previous;
// }, {});

// eqpSearch.equip = buildRegex(rQEqp);




// eqpSearch.equip = Object.keys(rQEqp).reduce(function(previous, current) {
//     // if(current.indexOf('equip') === -1)
//     previous[current] = {'$regex': rQEqp[current], '$options': 'i'};
//     return previous;
// }, {});
//print(tojson(eqpSearch));


// var eqpSearch = {};

// var eqpSearch = Object.keys(reqQuery).reduce(function(previous, current) {
//     if(current.indexOf('system') === -1)
//     previous[current] = {
//       Object.keys(current).reduce(function(previous1, current1) {
//      previous1[current1] = {'$regex': reqQuery[current1], '$options': 'i'};
//      return previous1;
//    };
//     return previous;
// }, {});


// eqpSearch.equip = Object.keys(reqQuery.equip).reduce(function(previous, current) {
//     if(current.indexOf('system') === -1)
//     previous[current] = {'$regex': reqQuery[current], '$options': 'i'};
//     return previous;
// }, {});

//var match1 = {};
//var match2 = {};

//match1 = sysSearch;
//match2 = eqpSearch;