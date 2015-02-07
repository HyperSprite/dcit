
var     logger = require('../lib/logger.js'),
         dates = require('../lib/dates.js');

/* This is where string functions live
  Sadly, most are too specific to get a lot of reuse.
  Some get used all over though
*/
//this file takes 4 address lines and combines them
// used first in locations.js to handle pulling in the 4 address lines.

// change (!check) remove read
exports.accessCheck = function (check){
var access = new Object();
if(!check){access.noAccess=1;}else{
if(check.access > 4){access.root = 1;}
if(check.access > 3){access.delete = 1;}
if(check.access > 2){access.edit = 1;}
if(check.access > 1){access.read = 1;}
}
return access;
};

// This function takes the ugly long javascript date and converts it into YYYY/MM/DD
exports.dateMod = function (s) {
    if (!s){
    return '';
    }else{
    var mydate,
        theyear,
        themonth,
        thetoday,
        dateResults;   
    //var mydate= s;
    //var theyear=mydate.getFullYear();
    //var themonth=exports.pad(mydate.getMonth()+1);
    //var thetoday=exports.pad(mydate.getDate());
    //var dateResults = theyear+'-'+themonth+'-'+thetoday;
    mydate= s;
    theyear=mydate.getFullYear();
    themonth=exports.pad(mydate.getMonth()+1);
    thetoday=exports.pad(mydate.getDate());
    dateResults = theyear+'-'+themonth+'-'+thetoday;
    return dateResults;
    }
};

exports.dateTimeMod = function (s) {
    if (!s){
    return '';
    }else{
    var mydate= s;
    var theyear=mydate.getFullYear();
    var themonth=exports.pad(mydate.getMonth()+1);
    var thetoday=exports.pad(mydate.getDate());
    var thehours=exports.pad(mydate.getHours());
    var themin=exports.pad(mydate.getMinutes());
    var dateResults = theyear+'-'+themonth+'-'+thetoday+' '+thehours+':'+themin;
    return dateResults;
    }
};

exports.addMonths = function(dateObj, num) {
    if(dateObj){
    var currentMonth = dateObj.getMonth();
    dateObj.setMonth(dateObj.getMonth() + num);

    if (dateObj.getMonth() != ((currentMonth + num) % 12)){
        dateObj.setDate(0);
    }}
    return dateObj;
};
// add warranty mo to date and see if it is out of warranty
exports.addAndCompDates = function(dateCheck, num){
    var results;
    if (!num){
        num = 36;
    }
    if (dateCheck){
    dateCheck = exports.addMonths(dateCheck, num);
    dateCheck = dates.compare(dateCheck,Date.now());
    if(dateCheck === 1){
        results = null;
    }else{
        results = dateCheck;
    }}
    logger.info('results dateCheck >'+results);
    return results;
};


// for bulk imports - checks to see if date exists, if it does, uses, if not sets to current 
exports.compareDates = function(modifiedOn){
if(!modifiedOn){
    modifiedOn = Date.now();
    }else{
        modifiedOn = dates.convert(modifiedOn);
    }
    return modifiedOn;
};

exports.ipToNum= function(ip) {
 var d = ip.split('.');
 return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
};

exports.numToIp= function(number) {
 var ip=num%256;
 for (var i=1;i<=3;i++)
 {
   number=Math.floor(num/256);
   ip=number%256+'.'+ip;
 }
 return ip; // As string
 };

/* could be new dateMod

new Date().toISOString().
  replace(/T/, ' ').      // replace T with a space
  replace(/\..+/, '')     // delete the dot and everything after
> '2012-11-04 14:55:45'

*/

// incoming, outgoing date for bulk imports
// will not work on european style dates
//
// need to replace / with -

// for MAC addresses
// this cleans up new values removes all spaces, makes them all caps
exports.mTrim = function(current){
    if (typeof current === 'undefined'){
    } else {
        current = current.replace(/[^a-fA-F0-9][:]/gi, '');
        current = current.toUpperCase();
        //logger.info('mTrim >'+current);
    }
    return current;
};


// strTgs.cTrim( removes spaces, converts to UPPER case
// this cleans up new values removes all spaces, makes them all caps
exports.cTrim = function(current){
    if (typeof current === 'undefined'){
    } else {
        current = current.replace(/[^a-z0-9._\-]/gi, '');
        current = current.toUpperCase();
        //logger.info('cTrim >'+current);
    }
    return current;
};

// strTgs.clTrim( removes spaces, converts to LOWER case
// this cleans up new values removes all spaces, makes them all caps
exports.clTrim = function(current){
    if (typeof current === 'undefined'){
    } else {
        current = current.replace(/[^a-z0-9._\-][:]/gi, '');
        current = current.toLowerCase();
        //logger.info('clTrim >'+current);
    }
    return current;
};

// strTgs.sTrim( - removes all spaces
// this cleans up new values removes all spaces
exports.sTrim = function(current){
    if (typeof current === 'undefined'){
    } else {
        current = current.replace(/[^a-z0-9._\-]/gi, ''); 
        //logger.info('sTrim >'+current);
    }
    return current;
};

// strTgs.sTrim( - removes all spaces
// this cleans up new values removes all spaces
exports.stTrim = function(current){
    if (typeof current === 'undefined'){
    } else {
        current = current.replace(/[^a-z0-9.~_\-]/gi, ''); 
        //logger.info('stTrim >'+current);
    }
    return current;
};

// strTgs.sTrim( - removes all spaces
// this cleans up new values removes all spaces
exports.stcTrim = function(current){
    if (typeof current === 'undefined'){
    } else {
        current = current.replace(/[^a-z0-9.,~_\- ]/gi, ''); 
        //logger.info('stTrim >'+current);
    }
    return current;
};
// strTgs.uTrim( - leaves spaces, trims
// this cleans up new values removes leading and trailing spaces but not inside spaces
exports.uTrim = function(current){
    if (typeof current === 'undefined'){
    } else {
        current = current.replace(/[^a-z0-9._\- ][:]/gi, '');
        current = current.trim();
        //logger.info('uTrim >'+current);
    }
    return current;
};
// used everywhere
// this checks old and new values and removes unwanted char,
exports.uCleanUp = function(old,current){
   //logger.info ('was>'+old);
   //logger.info ('now>'+current);
    if(old==='' && current==''){
        //logger.info('uCleanup - old=== & new== ');
    }else if (typeof current ==='undefined'){
        //logger.info('uCleanup - typeof used');
    }else{
        //logger.info('uCleanup - current trim');
        current = exports.uTrim(current);
        current = current.trim();
    }
    return current;
};
// this checks old and new values and removes unwanted char, leaves spaces
exports.mCleanUp = function(old,current){
    //logger.info ('was>'+old);
    //logger.info ('now>'+current);
    if(old==='' && current==''){
        //logger.info('mCleanup - old=== & new== ');
    }else if (typeof current ==='undefined'){
        //logger.info('mCleanup - typeof used');
    }else{
        //logger.info('mCleanup - current trim');
        current = exports.mTrim(current);
    }
    return current;
};

// strTgs.clCleanUp(
// this checks old and new values and removes unwanted char, no space, all lower
exports.clCleanUp = function(old,current){
   //logger.info ('was>'+old);
   //logger.info ('now>'+current);
    if(old==='' && current==''){
        //logger.info('clCleanup - old=== & new== ');
    }else if (typeof current ==='undefined'){
        //logger.info('clCleanup - typeof used');
    }else{
        //logger.info('clCleanup - current trim');
        current = exports.clTrim(current);
    }
    return current;
};

// strTgs.cCleanUp(
// this checks old and new values and removes unwanted char, no space, all upper
exports.cCleanUp = function(old,current){
   //logger.info ('was>'+old);
   //logger.info ('now>'+current);
    if(old==='' && current==''){
        //logger.info('clCleanup - old=== & new== ');
    }else if (typeof current ==='undefined'){
        //logger.info('clCleanup - typeof used');
    }else{
        //logger.info('clCleanup - current trim');
        current = exports.cTrim(current);
    }
    return current;
};


// this checks old and new values and removes unwanted char, no space, all lower
exports.stcCleanup = function(old,current){
   //logger.info ('was>'+old);
   //logger.info ('now>'+current);
    if(old==='' && current==''){
        //logger.info('stcCleanup - old=== & new== ');
    }else if (typeof current ==='undefined'){
        //logger.info('stcCleanup - typeof used');
    }else{
        //logger.info('stcCleanup - current trim');
        current = exports.stcTrim(current);
    }
    return current;
};

// This cleans up a CSV array using uTrim ^^^ 
exports.csvCleanup = function(csv){
   //logger.info('csvCleanup');
        csv = csv.split(',');
    for(i=0;i<csv.length;i++){
       //logger.info('before >'+csv[i]);
        csv[i] = exports.uTrim(csv[i]);
       //logger.info('after  >'+csv[i]);
        }
        return csv;
};
// location combiner cleans up input and puts them together unless
// the input is empty
exports.locComb = function(rack,ru){
    var rack_ru;
    if(!rack || !ru){
    }else{
    rack = exports.uTrim(rack);
    ru = exports.uTrim(ru);
    rack_ru = rack+'_'+ru;
    }
    return rack_ru;
};

exports.noteAdd = function (currentNote,newNote) {
    if(newNote){
        if(currentNote){
            result = currentNote+' '+newNote;
        }else{
            result = newNote;
        }
    }else{
    result = currentNote;
    }
    return result;
}



// adds a leadig 0 to numbers 1-9
exports.pad = function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
};




//returns single array of items from collection that matches the FindThis
// example
// findThis is equipment.equipSN
// inThat is the Systemdb collection with minimized results 
exports.findThisInThat = function(findThis,inThat){
    var data;
    if(!findThis){
    logger.info('findThisInThat.findThis is null');
    data = false;
    }else{
    // Get Index of object based on id value
    logger.info('findOne  >'+findThis);
    var arrayPosition = inThat.map(function(arrayItem){
    // Match our findThis to inThat Object    
    return arrayItem.systemEquipSN; }).indexOf(findThis);
    if(!inThat[arrayPosition]){
    logger.info('inThat[arrayPosition]');
    data = false;
    }else{
    // Get our found Object
    data = inThat[arrayPosition];
    }}
    return data;
    
};

//returns single array of items from collection that matches the FindThis
// example
// findThis is equipment.equipSN
// inThat is the Systemdb collection with minimized results
// Not DRY yet, need to work on that 
exports.findThisInThat2 = function(findThis,inThat){
    var data;
    if(!findThis){
    //logger.info('findThisInThat.findThis is null');
    data = false;
    }else{
    // Get Index of object based on id value
    //logger.info('findOne  >'+findThis);
    var arrayPosition = inThat.map(function(arrayItem){
    // Match our findThis to inThat Object    
    return arrayItem.equipSN; }).indexOf(findThis);
    if(!inThat[arrayPosition]){
    //logger.info('inThat[arrayPosition]');
    data = false;
    }else{
    // Get our found Object
    data = inThat[arrayPosition];
    }}
    return data;
    
};


//returns single document array of items from collection that matches the FindThis
// example
// findThis is equipment.equipSN
// inThat is the Systemdb collection with minimized results 
exports.findThisInThatOpt = function(findThis,inThat){
    // Get Index of object based on id value
    //logger.info('findOne  >'+findThis);
    var arrayPosition = inThat.map(function(arrayItem){
    // Match our findThis to inThat Object    
    return arrayItem.optListKey; }).indexOf(findThis);
    // Get our found Object
    var data = inThat[arrayPosition].optListArray;
    //logger.info('data'+data);
    return data;
};
//
exports.checkNull = function(check){
    if(!check){
    check = 1;
    }
    return check;
};


// used in Equipment List
// cheating, this could be better, this could break if someone has a 100 U rack
// (not that they could, but) 
// takes a Equipment equipLocation value and shortens it by 3 to return the rack name
exports.ruToLocation = function(ruToLoc){
    if(!ruToLoc){logger.info('err');}else{
        ruToLoc = ruToLoc.substring(0,ruToLoc.length-3);
    return ruToLoc;
    }
};

// returns a rack elevation (does the opposite of above)
exports.ruElevation = function(ruToLoc){
    if(!ruToLoc){logger.info('err');}else{
        ruToLoc = ruToLoc.slice(-2);
    return ruToLoc;
    }
};
// takes a checkbox answer and returns true or false
exports.doCheckbox = function(answer){
    if(answer === true){
    answer = true;
   //logger.info('Checkbox is true');
    }else{
    answer = false;
   //logger.info('Checkbox is false');
    }
    return answer;
};

// uesd for checkboxes in Equipment, model is set to defalut as 'false' when created. 
// the value is put in here, true returns 'checked' and nothing if false
// handlebars will display 'checked' if checked, nothing if false
exports.setCheckBox = function(startVal){
   //logger.info('setCheckBox sV>'+startVal);
    var newVal = '';
    if(startVal===true){
        newVal = 'checked';
        }
   //logger.info('setCheckBox nV>'+newVal);    
    return newVal;
};



/* example of mongoose query Category.find({parentuid:catid}, null, {sort:{name:1}, skip:0, limit:20}, function(err, categories) {						 
				  callback(err, categories);
			  }); */
    
// used in Equipment List
// this compares TEST and returns HTML to color the VALUE. 

exports.trueFalseIcon = function(test,value){
    if(!value){value = 'None';}
    if(test === true || test === 'In Service'){
        test = '<strong class="text-success">'+value+'</strong>';
    }else if(test === 'Recieved' || test ===  'Spare' || test ===  'Next Build' || test ===  'Possible'){
        test = '<strong class="text-info">'+value+'</strong>';
    }else if(test === false || test ===  'Damaged' || test ===  'Missing'){
        test = '<strong class="text-danger">'+value+'</strong>';
    }else if(test === 'In Service with Issues' || test ===  'Spare with issues' || test ===  'Out for RMA' || test ===  'Blocked'){
        test = '<strong class="text-warning">'+value+'</strong>';
    }else if(test === 'Build in Progress'){
        test = '<strong class="text-primary">'+value+'</strong>';       
    }else{
        test = '<strong class="text-default">'+value+'</strong>';
    }
    return test;
};

exports.trueFalseD3 = function(test,value){
    if(!value){value = 'None';}
    if(test === true || test === 'In Service'){
        test = 'green';
    }else if(test === 'Recieved' || test ===  'Spare' || test ===  'Next Build' || test ===  'Possible'){
        test = 'blue';
    }else if(test === false || test ===  'Damaged' || test ===  'Missing'){
        test = 'red';
    }else if(test === 'In Service with Issues' || test ===  'Spare with issues' || test ===  'Out for RMA' || test ===  'Blocked'){
        test = 'black';
    }else if(test === 'Build in Progress'){
        test = 'lightblue';       
    }else{
        test = 'white';
    }
    return test;
};
// this returns the color of equipment based on type
exports.equipTypeColor = function(equipType){
 var color;
    switch(equipType){
    case 'Storage':
        color = '#F2BFBF';
        break;
    case 'Network':
        color = '#99CCFF';
        break;
    case 'Console':
        color = '#BDEEBD';
        break;
    case 'Power':
        color = '#F5CCF5';
        break;
    case 'Patch':
        color = '#7A7A52';
        break;
    case 'CblMgmt':
        color = '#D9CCBF';
        break;
    case 'KVM':
        color = '#FFFF85';
        break;
    case 'Server':
        color = '#FFFFD9';
        break;
    default:
        color = '#E0E2E6';
        break;
    }
    //logger.info('equipTypeColor'+color);
    return color;
};

// This was never used but seems interesting, leaving it here for examples
exports.getFormIndex = function(formIndexAndPost){
    var findX = formIndexAndPost.indexOf('-');
    var formPost;
    formPost.fpData = formIndexAndPost.substring(findX+1);
    formPost.fpIndex = formIndexAndPost.substring(1,findX);
    // fpData will have the form post data
    // fpInxex will have the form post index    
    return formPost;
};

// Not quite working, need to figure out how to take variables and use them in the database.key and value 
// db = database
// dbq in an object with dKey and dVal are key:val pair ther dRet is returned
// (Key - conType, dVal - Main, dRet - city)
//var dbqCountry = {
//    dKey: 'conType',
//   dVal: 'Main',
//   dRet: 'country'
//};

// this converts meters to feet
exports.convertMetersToFeet = function(req){
    if(!req){
       //logger.info('no cageInMeters');
    } else {
        var res=Math.round(req*3.2808);
        return res; 
    }

};

// this is used for the Datacenter list for showing the proper city 
exports.arrayByType = function(db,dbq){
    var dKey = dbq.dKey,
        dVal = dbq.dVal,
        dRet = dbq.dRet,
        k;
    for (k = db.length - 1; k >= 0; --k) {
    //logger.info('*************** | '+ dKey + ' '+ dVal + ' ' + dRet + ' |  *****************');    
        if(db[k][dbq.dKey] == [dbq.dVal]){
       //logger.info(db[k][dRet] + ' 3');
            //logger.info('*************** | '+ dKey + ' '+ dVal + ' ' + dRet + ' 2 |  *****************');
        return db[k][dbq.dRet];
        
        }}
    };

exports.findDCParent = function (child,dc){
        var abbr;
        for(i=0;i<dc.length;i++){
            if(dc[i].id == child){
                abbr = dc[i].abbreviation;
            }
        }
           //logger.info('dc abbr > '+abbr);
            return abbr;       
        };

// Used in Racks 
//this takes a dc.cage ID and converts it to cage code
exports.findCGParent = function (child,dc){
   //logger.info('uber child: '+child);
   //logger.info('uber dc:    '+dc);

// takes single and makes it an array  or 'toarray'
    if(!dc.length){
       dc = [dc]; 
    }
        var uber;
        for(i=0;i<dc.length;i++){
   //logger.info('uber for i: '+dc[i].abbreviation);
            for(j=0;j<dc[i].cages.length;j++){
                if(dc[i].cages[j].id == child){
   //logger.info('uber for j: '+dc[i].abbreviation);
                    uber ={
                    fullName: dc[i].fullName,
                    abbreviation: dc[i].abbreviation,
                    foundingCompany: dc[i].foundingCompany,
                    powerNames: dc[i].powerNames,
                    cageAbbreviation: dc[i].cages[j].cageAbbreviation,
                    cageNickname: dc[i].cages[j].cageNickname,
                    cageName: dc[i].cages[j].cageName,
                    };
                }
        }}
   //logger.info('uber > '+uber);
            return uber;        
        };    
    

exports.findOneCGParent = function (child,dc){
   //logger.info('uber child: '+child);
   //logger.info('uber dc:    '+dc);
        var uber;
            for(j=0;j<dc.cages.length;j++){
                if(dc.cages[j].id == child){
   //logger.info('uber for j: '+dc.abbreviation);
                    uber ={
                    abbreviation: dc.abbreviation,
                    foundingCompany: dc.foundingCompany,
                    cageAbbreviation: dc.cages[j].cageAbbreviation,
                    cageNickname: dc.cages[j].cageNickname,
                    cageName: dc.cages[j].cageName,
                    };
                }
        }
   //logger.info('uber > '+uber);
            return uber;        
        };    








        
// no longer needed
// Used in Rack Create Post to compile rack rU lables
exports.compUs = function(rUs,dc,cage,rack){
    
    rUs = parseFloat(rUs)+1;
   //logger.info(rUs);
    //rack = rack.trim();
    var arr = new Array;
    if (isNaN(rUs)){
       //logger.info('rUs undefiend');
    } else {
   //logger.info('rUs defined');
        for(i=0;i<rUs;i++){
            //logger.info(dc+'_'+cage+'_'+rack+'_'+exports.pad(i));
            arr[i] = dc+'_'+cage+'_'+rack+'_'+exports.pad(i);
           //logger.info('making rUs :'+ arr[i]);
        }
   //logger.info('rUs requested:'+rUs);    
    }
    return arr;
};

exports.displayrUs = function(rUs){

};
exports.addressCleaner = function(dc){
            var full ='';
            if (typeof dc.address1 !== 'undefined'){
                full = dc.address1;}
            if (typeof dc.address2 !== 'undefined'){
                full = full + '<br>' +  dc.address2;}
            if (typeof dc.address3 !== 'undefined'){
                full = full +  '<br>' + dc.address3;}
            if (typeof dc.address4 !== 'undefined'){
                full = full + '<br>' + dc.address4;}
           //logger.info(full);
            return full;
};    
