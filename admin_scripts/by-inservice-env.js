// mongodb file
use dcit

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
          { $or: [
            {'equip.equipStatus': 'In Service'},
            {'equip.equipStatus': 'In Service with issues'},
          ]},
        },
        /*{$group:
        {
          _id: {
            E: '$systemEnviron',
            S: '$systemStatus',
          },
          'count': {$sum: 1},
        },
        }, */

        {$group:
          {
            _id: '$systemEnviron',
            countApp: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production App' ]}, 1, 0]}},
            countDb: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production DB' ]}, 1, 0]}},
            dcAbbr: equip.dcAbbr,
          },
        },
        { $sort:
        {
          'countApp': -1,
          'countDb': -1,
          
        },
        }, 
        { $project:
        {
          '_id': 0,
          'env': '$_id',
          'countApp': '$countApp',
          'countDb': '$countDb',
          'dcAbbr': '$dcAbbr',
        },
        }, 
    ]);
it
