// mongodb file
use dcit



var findThis = '_';
var inEnv = 'ri2';

    db.systemdbs.aggregate([
      {$match:
        {$or: [
          {'systemStatus': 'Production App'},
          {'systemStatus': 'Production DB'},
        ]},
        },
        {$lookup:
          { from: 'equipment',
            localField: 'systemEquipSN',
            foreignField: 'equipSN',
            as: 'equip',
          },
        },
        {$match:
          { 'equip.equipLocation': { '$regex': findThis, '$options': 'i'},
        },
        },

        {$match:
          { $or: [
            {'equip.equipStatus': 'In Service'},
            {'equip.equipStatus': 'In Service with issues'},
          ]},
        },
     /*   {$match:
          { 'systemEnviron': inEnv},
        },  */
        {$group:
        {
          _id: { env: '$systemEnviron', sysEnv: '$systemEnviron', sysRole: '$systemRole'},
          countApp: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production App' ]}, 1, 0]}},
          countDb: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production DB' ]}, 1, 0]}},
        },
        },
        {$sort:
        {
          '_id.env': 1,
          'countApp': -1,
          'countDb': -1,
        },
        },
        { $project:
        {
          '_id': 0,
          'env': '$_id.env',
          'role': '$_id.sysRole',
          'countApp': '$countApp',
          'countDb': '$countDb',
        },
        },
    ])
it
it

