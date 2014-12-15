// Map Reduce Collections

var     logger = require('winston'),
        strTgs = require('../lib/stringThings.js'),
      ObjectId = require('mongoose').Types.ObjectId;

// Models
var Datacenter = require('../models/datacenter.js'),
          Rack = require('../models/rack.js'),
     Optionsdb = require('../models/options.js'),
     Equipment = require('../models/equipment.js'),
      Systemdb = require('../models/system.js');

var mongoose = require('mongoose');

var mrSystemEnvironSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    value: Number,
});

var MrSystemEnviron = mongoose.model('MrSystemEnviron', mrSystemEnvironSchema);
module.exports = MrSystemEnviron;

exports.mapredsystemEnviron = function(){
            var o = {};
            o.map = function () {emit(this.systemEnviron, 1);};
            o.reduce = function (k, vals) {return vals.length;};
            o.out = { replace: 'mrSystemEnviron'};
            o.verbose = true;
            
            Systemdb.mapReduce(o, function (err, model, stats) {
            if(err) throw err;
            logger.info('mrSystemEnviron took %d ms', stats.processtime);
            logger.info(model);
});
return stats;
};

  // other options that can be specified

    // o.query = { age : { $lt : 1000 }}; // the query object
    // o.limit = 3; // max number of documents
    // o.keeptemp = true; // default is false, specifies whether to keep temp data
    // o.finalize = someFunc; // function called after reduce
    // o.scope = {}; // the scope variable exposed to map/reduce/finalize
    // o.jsMode = true; // default is false, force execution to stay in JS
    // o.verbose = true; // default is false, provide stats on the job
    // o.out = {}; // objects to specify where output goes, by default is
        // returned, but can also be stored in a new collection
        //{inline:1} the results are returned in an array
        //{replace: 'collectionName'} add the results to collectionName: the results replace the collection
        //{reduce: 'collectionName'} add the results to collectionName: if dups are detected, uses the reducer / finalize functions
        //{merge: 'collectionName'} add the results to collectionName: if dups exist the new docs overwrite the old





