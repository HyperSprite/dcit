
    // this updates EndPoints when the system name changes
    // not yet working
            if (thisDoc.systemName !== strTgs.clTrim(bd.systemName)){
                Systemdb.find({'systemPorts.sysPortEndPoint': thisDoc.systemName},'systemName systemPorts.sysPortName systemPorts.sysPortEndPoint',function(err,sys){
                    sys.map(function(sy){
                        sy.systemPorts.map(function(sysPort){
                            if (thisDoc.systemName === sysPort.systemPorts.sysPortEndPoint){
                                context = {
                                    sys: sys.map(function(sy){
                                        return {
                                            systemPorts: sy.systemPorts.map(function(sysPort){
                                                if(thisDoc.systemName === sysPort.systemPorts.sysPortEndPoint){
                                                return{
                                                systemName: sy.systemName,
                                                sysPortName: sysPort.sysPortName,
                                                sysPortEndPoint: sysPort.sysPortEndPoint,
                                                modifiedBy: Date.now(),
                                                };}
                                            }),
                                            };
                                        }),
                                
                                };




                                return

                                systemdbCrud.systemdbPortsCreate(sysPort,req);
                            }else{
                                logger.warn('EndPoint error'+ sysPort.systemPorts.sysPortEndPoint);
                            }});});
