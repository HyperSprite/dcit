// Equipment crud
var logger = require('../lib/logger.js'), 
      Rack = require('../models/rack.js'),
    strTgs = require('../lib/stringThings.js'),
     dates = require('../lib/dates.js');

exports.rackPowerCreate = function (data,req){
    Rack.findOne({rackUnique: strTgs.clTrim(data.rackUnique)},function(err,rk){
    if(err){
        logger.warn('rkPortCreate'+data.rackPowUnique+err);
    }else if(!rk){
        logger.warn('rkPortCreate Failed lookup :'+data.rackPowUnique+' not found');
    } else {
        var portArray = [];
            for(var i = rk.powers.length - 1; i >= 0; i--) {
                portArray[i] = rk.powers[i].rackPowUnique;
            }
        var portPosition = portArray.indexOf(data.rackPowUnique);
            //logger.info('portPosition >'+portPosition);
        if(portPosition === -1){
                rk.powers.push({
                    rackPowMain: data.rackPowMain,
                    rackPowCircuit: strTgs.cTrim(data.rackPowCircuit),
                    rackPowUnique: data.abbreviation+'_'+data.rackPowMain+'_'+strTgs.cTrim(data.rackPowCircuit),
                    rackPowStatus: data.rackPowStatus,
                    rackPowVolts: strTgs.sTrim(data.rackPowVolts),
                    rackPowPhase: strTgs.sTrim(data.rackPowPhase),
                    rackPowAmps: strTgs.sTrim(data.rackPowAmps),
                    rackPowReceptacle: strTgs.cTrim(data.rackPowReceptacle),
                    rackPowModifiedby: 'Admin',
                    rackPowModifiedOn: strTgs.compareDates(data.modifiedOn),
                });
                eq.save(function(err){
        if(err) {
            logger.warn(err);
            logger.warn('rkPortCreate Failed write :'+data.rackPowUnique);
            return (err.stack);
        }else{
            logger.info('rkPortCreate Sucessful write :'+data.index+' : '+data.rackPowUnique);
            return ('done');
        }
    });        
        } else { 
        var thisDoc = eq.equipPorts[portPosition];
        if(data.overwite === 'no'){
            logger.warn('EqPortCreate CSV date overwite=no: '+data.index+' '+data.rackPowUnique);
        }else if(!data.modifiedOn && !data.overwrite){
            logger.warn('EqPortCreate CSV no modifiedOn or overwite: '+data.index+' '+data.rackPowUnique);
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){
              thisDoc.rackPowStatus = strTgs.uCleanUp(thisDoc.rackPowStatus,data.rackPowStatus);
                thisDoc.rackPowVolts = strTgs.uCleanUp(thisDoc.rackPowVolts,data.rackPowVolts);
                thisDoc.rackPowPhase = strTgs.uCleanUp(thisDoc.rackPowPhase,data.rackPowPhase);
                thisDoc.rackPowAmps = strTgs.uCleanUp(thisDoc.rackPowAmps,data.rackPowAmps);
                thisDoc.rackPowReceptacle = strTgs.uCleanUp(thisDoc.rackPowReceptacle,data.rackPowReceptacle);
                thisDoc.modifiedOn = strTgs.compareDates(data.modifiedOn);
                thisDoc.modifiedBy ='Admin';  
            rk.save(function(err){
            if(err){
                logger.info('EqPortCreate Failed - '+err+' : '+data.index+' equipSN '+strTgs.cTrim(data.equipSN)+' found');
            }else{
            logger.info('EqPortCreate Sucessful write :'+data.index+' : '+data.equipSN);
            return ('done');
            }
        });
    } else {
        logger.warn('EqPortCreate CSV modifiedOn date older: '+data.index+' '+data.equipSN);
    }

    }}
});

};