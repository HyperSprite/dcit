//this file takes 4 address lines and combines them
// used first in locations.js to handle pulling in the 4 address lines.

//this function takes 4 address lines and combines only the ones that
//do not return "undefined" and returns them on mulitple lines.
exports.addressCleaner = function(dc){
            var full ='';
            if (typeof dc.address1 !== 'undefined'){
                full = dc.address1};
            if (typeof dc.address2 !== 'undefined'){
                full = full + '<br>' +  dc.address2};
            if (typeof dc.address3 !== 'undefined'){
                full = full +  '<br>' + dc.address3};
            if (typeof dc.address4 !== 'undefined'){
                full = full + '<br>' + dc.address4};
            console.log(full);
            return full;
};

// This function takes the ugly long javascript date and converts it into YYYY/MM/DD
exports.dateMod = function (s) {
    var mydate= s;
    var theyear=mydate.getFullYear();
    var themonth=mydate.getMonth()+1;
    var thetoday=mydate.getDate();
    var dateResults = theyear+"/"+themonth+"/"+thetoday;
    return dateResults;
};




// Not quite working, need to figure out how to take variables and use them in the database.key and value 
// db = database
// dbq in an object with dKey and dVal are key:val pair ther dRet is returned
// (Key - conType, dVal - Main, dRet - city)
exports.arrayByType = function(db,dbq){
    var dKey = dbq.dKey,
        dVal = dbq.dVal,
        dRet = dbq.dRet,
        k;
    for (k = db.length - 1; k >= 0; --k) { 
     console.log("*************** | "+ dKey + " "+ dVal + " " + dRet + " |  *****************");    
        if(db[k][dbq.dKey] == [dbq.dVal]){
        console.log(db[k][dRet] + " 3");
             console.log("*************** | "+ dKey + " "+ dVal + " " + dRet + " 2 |  *****************");
        return db[k][dbq.dRet];
        
        }}
    };

