var logger = require('./lib/logger.js');

exports.seedOptionsDataBase = (function(Optionsdb){
new Optionsdb({
    optListName: 'Equipment Status',
    optListKey: 'optEquipStatus',
    optListArray:['Not yet ordered','Ordered','In transit','Received','Spare','Assigned','Build in Progress','Ready','In Service','In Service with issues','Spare with issues','Out for RMA','Damaged','Decommissioned','End of Life - Recycled','End of Life - RMA','End of Life - Transfered','Missing'],
    }).save();
new Optionsdb({
    optListName: 'Equipment Type',
    optListKey: 'optEquipType',
    optListArray:['Full Rack','Server','VM Server','Storage','Network','Console','Power','Component','Patch','CblMgmt','Empty','KVM','Misc'],
    }).save();
new Optionsdb({
    optListName: 'System Status',
    optListKey: 'optSystStatus',
    optListArray:['Production App','Production DB','Production Storage','Production','Non-prod App','Non-prod DB','Non-prod Storage','Non-prod','Decommissioned','Uncategorized'],
    }).save();
new Optionsdb({
    optListName: 'System Port Type',
    optListKey: 'optSystPortType',
    optListArray:['Console','Ethernet','Infiniband','Interconnect','NetMgmt','Power','SAN'],
    }).save();
new Optionsdb({
    optListName: 'Environment',
    optListKey: 'optEnvironment',
    optListArray:['Prod','UAT','QA','Eng'],
    }).save();
new Optionsdb({
    optListName: 'Rack Status',
    optListKey: 'optRackStatus',
    optListArray:['Possible','Next Build','Build in Progress','Ready','In Service','Blocked','Decommissioned','Storage'],
    }).save();
new Optionsdb({
    optListName: 'Level',
    optListKey: 'optImpactLevel',
    optListArray:[9,8,7,6,5,4,3,2,1,0],
    }).save();
new Optionsdb({
    optListName: 'Netmask',
    optListKey: 'optMask',
    optListArray:[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
    }).save();
new Optionsdb({
    optListName: 'Models',
    optListKey: 'optModels',
    optListArray: ['Datacenter','Rack','Optionsdb','Equipment','Equipment.equipPorts','Systemdb','Systemdb.systemPorts'],
    }).save();    
    logger.info("created new Optionsdb.Status");
    
});

exports.seedDatacenter = (function(Datacenter){

    new Datacenter({
        fullName: 'Test Center',
        abbreviation: 'test-cent',
        foundingCompany:'Oracle, Inc',
        contacts:[{
            contactCnt:1,
            conGuid:'1234Test Center',
            conType:'Main',
            conName:'Test Center',
            address1: 'Test Center Inc.',
            address2: '1122 Boogieboogie Ave.',
            city: 'Central',
            state: 'CA',
            country: 'US',
            zip: '95111',
            lat: 37.3007582,
            lon: 121.8336904,
            conURL:'www.testcenterinc.com',
            conPho1Num: 5555551111,
            conPho1Typ: 'Main',
            conPho2Num: 5555551122,
            conPho2Typ: 'Fax',
            conNotes: 'Test DC never expires. Who uses a Fax anymore anyway. What is up with that?',
            },
            {
            contactCnt:2,
            conGuid:'1234Support',
            conType:'Support',
            conName:'Support',
            conEmail:'support@testcenterinc.com',
            conPho1Num: 5555551111,
            conPho1Typ: '24/7 Support',
            conPho2Num: 5555551122,
            conPho2Typ: 'Magic Hands',
            conNotes: 'When you call, be ready to describe the location of the equipment.', 
            },
        ],
        cages:[{
            cageNickname:'test-cent-Main',
            cageAbbreviation: '01',
            cageName:'27.34M',
            cageInMeters:435,
            cageWattPSM:11,
            cageNotes:'We can use 8ft cabinets in here.'
            },
            {
            cageNickname:'test-cent-Storage',
            cageAbbreviation: '02',
            cageName:'27.36D',
            cageInMeters:52,
            cageWattPSM:13,
            cageNotes:'Running low on power'
            },
        ],  
    }).save();
    
    logger.info("created new Datacenters");
});