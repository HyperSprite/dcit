const logger = require('../lib/logger.js');
const dates = require('../lib/dates.js');
const moment = require('moment');
const momentTZ = require('moment-timezone');
const addContext = require('contextualizer');
const Datacenter = require('../models/datacenter.js');

/* This is where string functions live
  Sadly, most are too specific to get a lot of reuse.
  Some get used all over though
*/
//this file takes 4 address lines and combines them
// used first in locations.js to handle pulling in the 4 address lines.

// change (!check) remove read
exports.accessCheck = function(check) {
  var access = new Object();
  if (!check) {
    access.noAccess = 1;
  } else {
    if (check.access > 4) {
      access.root = 1;
    }
    if (check.access > 3) {
      access.delete = 1;
    }
    if (check.access > 2) {
      access.edit = 1;
    }
    if (check.access > 1) {
      access.read = 1;
    }
  }
  return access;
};

exports.arrayUnique = function(a) {
  return a.reduce(function(p, c) {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
};

exports.notAuth = {
  type: 'danger',
  intro: 'Sorry!',
  message: 'Not Authorized!',
};

module.exports.errMsg = (eMsg) => {
  const tmpMsg = {
    type: 'danger',
    intro: 'Error',
    message: eMsg,
  };
  return tmpMsg;
};
    // date Cleanup to take posted dates and make them come back right.
exports.dCleanup = function(orgDate, newDate, userTZ) {
  var dateTest = 1;
  var workDate;
  if (!orgDate && !newDate) dateTest = 1; // no dates
  if (!orgDate && newDate) dateTest = 2; // newDate but no orgDate
  if (orgDate && !newDate) dateTest = 1; // orgDate but no newDate
  if (exports.dateMod(orgDate) === newDate) dateTest = 3; // orgDate === newDate
  if (exports.dateMod(orgDate) !== newDate) dateTest = 2; // orgDate !== newDate
  var dateRes;
  switch (dateTest) {
    case 2:
      //    logger.info('dCleanup 2'+dateTest+' '+newDate);
      if (moment(newDate).isValid() === false) {
        dateRes = null;
        //                logger.info('2.2');

      } else {
        workDate = moment(newDate);
        //                logger.info('2.1.1'+newDate+'--'+userTZ+' workDate'+workDate);

        dateRes = momentTZ(workDate, userTZ);
        //                logger.info('2.1.2'+dateRes);
      }
      break;
    case 3:
      dateRes = orgDate;
      //        logger.info('dCleanup 2'+dateTest+' '+dateRes);
      break;
    case 1:
      dateRes = null;
      break;
  }
  //    logger.info('dCleanup '+dateTest+' '+dateRes);
  return dateRes;
};

// date check
exports.dateRemix = function(orgDate, newDate, userTZ) {
  if (!orgDate && !newDate) {
    //        logger.info('no dates');
    return;
  } else if (!orgDate) {
    //        logger.info('no orgDate');
    newDate = exports.dateAddTZ(newDate, userTZ);
    return newDate;
  } else if (!newDate) {
    //        logger.info('dCleanup - no new date');
    return orgDate;
  } else if (exports.dateMod(orgDate) === newDate) {
    //        logger.info('dCleanup - match'+orgDate+' '+newDate);
    return orgDate;
  } else {
    //        logger.info('dCleanup - no match');
    return newDate;
  }
};


exports.dateAddTZ = function(theDate, userTZ) {
  var tempDate = moment(theDate);
  //    logger.info('dateAddTZ 120>'+theDate + userTZ + tempDate);
  if (moment(theDate).isValid() === false) {
    //    logger.info('dateAddTZ 122 null');
    theDate = null;
  } else {
    theDate = momentTZ(tempDate, userTZ).format();
    //    logger.info('dateAddTZ 126>'+theDate);
  }
  //    logger.info('dateAddTZ 128>'+theDate);
  return theDate;
};


exports.dateMod = function(s) {
  if (!s) {
    return;
  } else {
    s = moment(s).format('YYYY-MM-DD');
  }
  return s;
};

exports.dateTimeMod = function(s) {
  var theDate;
  if (!s) {
    return;
  } else {
    theDate = moment(s).format('YYYY-MM-DD HH:mm');
  }
  return theDate;
};


exports.addMonths = function(dateObj, num) {
  if (dateObj) {
    var currentMonth = dateObj.getMonth();
    dateObj.setMonth(dateObj.getMonth() + num);

    if (dateObj.getMonth() != ((currentMonth + num) % 12)) {
      dateObj.setDate(0);
    }
  }
  return dateObj;
};
// add warranty mo to date and see if it is out of warranty
exports.addAndCompDates = function(dateCheck, num) {
  var results;
  if (!num) {
    num = 36;
  }
  if (dateCheck) {
    dateCheck = exports.addMonths(dateCheck, num);
    dateCheck = dates.compare(dateCheck, Date.now());
    if (dateCheck === 1) {
      results = null;
    } else {
      results = dateCheck;
    }
  }
  //logger.info('results dateCheck >'+results);
  return results;
};


// for bulk imports - checks to see if date exists, if it does, uses, if not sets to current
exports.compareDates = function(modifiedOn, userTZ) {
  if (!modifiedOn) {
    modifiedOn = Date.now();
  } else {
    modifiedOn = dates.convert(modifiedOn);
    modifiedOn = exports.dateAddTZ(modifiedOn, userTZ);
  }
  return modifiedOn;
};
// for bulk imports makes it a date and adds time zone

exports.convertDates = function(dateToCon, userTZ) {
  modifiedOn = dates.convert(dateToCon);
  modifiedOn = exports.dateAddTZ(dateToCon, userTZ);

  return dateToCon;
};

exports.ipToNum = function(ip) {
  var d = ip.split('.');
  return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
};

exports.numToIp = function(number) {
  var ip = num % 256;
  for (var i = 1; i <= 3; i++) {
    number = Math.floor(num / 256);
    ip = number % 256 + '.' + ip;
  }
  return ip; // As string
};



// incoming, outgoing date for bulk imports
// will not work on european style dates
//
// need to replace / with -
//var macAddress = /\d{2}:\d{2}:\d{2}:\d{2}:\d{2}:\d{2}/;
//console.log(macAddress.test("10:20:30:40:50:60"));
// → true

// for MAC addresses search
// this cleans up new values removes all spaces, makes them all caps
exports.macSearchTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-fA-F0-9][:]/gi, '');
    current = current.toUpperCase();
    //logger.info('mTrim >'+current);
  }
  return current;
};

// for MAC addresses entry, so it goes in proper
// this cleans up new values removes all spaces, makes them all caps
exports.mTrim = function(current) {
  if (typeof current === 'undefined' || current === '') {
    current = '';
  } else {
    var mA = [],
      mB = '';
    mA = current.match(/([a-fA-F0-9]{2})/g);
    for (var i = 0; i < mA.length; i++) {
      mB = mB + mA[i];
      mB = (i < 5) ? mB + ':' : mB;
    }
    current = mB.toUpperCase();
  }
  return current;
};


// strTgs.cTrim( removes spaces, converts to UPPER case
// this cleans up new values removes all spaces, makes them all caps
// removes all but '-' and '_'.
exports.cTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-z0-9_\-]/gi, '');
    current = current.trim();
    current = current.toUpperCase();
    //logger.info('cTrim >'+current);
  }
  return current;
};

// strTgs.csTrim( removes spaces, converts to LOWER case
// this cleans up new values removes all spaces, makes them all lower case
exports.csTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-z0-9_\-]/gi, '');
    current = current.trim();
    current = current.toLowerCase();
    //logger.info('clTrim >'+current);
  }
  return current;
};

exports.multiTrim = function(newVal, opts, ul) {
  var current = newVal;
  if (typeof current !== 'undefined') {
    if (ul === 1) {
      current = current.toUpperCase();
    } else if (ul === 2) {
      current = current.toLowerCase();
    }
    // logger.info('multiTrim'+ opts);
    switch (opts) {
      case 0: // lowercase letters, numbers, "-" "_" no spaces and trim
        // Used for System names, replaces clTrim
        // logger.info('multiTrim 0');
        current = current.replace(/[^a-z0-9_\-]/gi, '');
        current = current.toLowerCase();
        break;
      case 1: // uppercase letters, numbers, "-" "_" no spaces and trim
        // Used for SN, replaces cTrim
        // logger.info('multiTrim 1');
        current = current.replace(/[^a-z0-9_\-]/gi, '');
        current = current.toUpperCase();
        break;
      case 2: // lowercase letters, numbers, "-" "_" "," no spaces and trim
        // Used for systemParentId to allow , seperated entry, new
        // logger.info('multiTrim 2');
        current = current.replace(/[^a-z0-9_,\-]/gi, '');
        current = current.toLowerCase();
        break;
      case 3: // letters, numbers "-" "_" "~" no spaces
        // replaces stTrim
        current = current.replace(/[^a-z0-9.~_\-]/gi, '');
        break;
      case 4: // letters, numbers "-" "_" "~" no spaces
        // replaces stcTrim
        current = current.replace(/[^a-z0-9.,~_\-\/]/gi, '');
        break;
      case 5: // letters, numbers "." "-" "_" ":" leaves spaces in the string but trims the outside.
        // repaces uTrim
        current = current.replace(/[^a-z0-9._\- :@]/gi, '');
        current = current.trim();
        break;
      case 6: // letters, numbers "." "-" "_" "," ":" leaves spaces in the string but trims the outside.
        // repaces uTrim but with ","
        current = current.replace(/[^a-z0-9.,~_\- :]/gi, '');
        current = current.trim();
        break;
      case 7: // letters, numbers "." "-" "_" no spaces.
        // repaces sTrim
        current = current.replace(/[^a-z0-9._\-]/gi, '');
        break;
      case 8: // numbers "." "-" "_" no spaces.
        // just numbers
        current = current.replace(/[^0-9._\-]/gi, '');
        break;
      case 9: // lowercase letters, numbers, "-" "_" no spaces and trim
        // Used for System names, replaces clTrim
        // logger.info('multiTrim 0');
        current = current.replace(/[^a-z0-9_\-]/gi, '');
        break;
      case 10:
        // Mac address formatter, replaces mTrim
        // This if here because we validate the MAC is unique
        if (typeof current === 'undefined' || current === '') {
          current = undefined;
        } else {
          var mA = [];
          var mB = '';
          mA = current.match(/([a-fA-F0-9]{2})/g);
          for (var i = 0; i < mA.length; i++) {
            mB += mA[i];
            mB = (i < 5) ? `${mB}:` : mB;
          }
          current = mB;
        }
        break;
      default:
        // logger.info('multiTrim default');
        break;
    }


    //    current = current.trim();

    //logger.info('multiTrim >'+current);
  }
  return current;
};

module.exports.multiClean = (oldVal, newVal, act) => {
  var current = exports.multiTrim(newVal, act);
  var result;
  if (!oldVal && !current) {
    // logger.info('uCleanup - old=== & new== ');
  } else if (oldVal === current) {
    result = current;
  } else if (oldVal && !current) {
    console.log(`was> ${oldVal}`);
    console.log(`now> ${current}`);
    // logger.info('uCleanup - typeof used');
  } else {
    console.log(`was> ${oldVal}`);
    console.log(`now> ${current}`);
    // logger.info('uCleanup - current trim');
    result = exports.multiTrim(current, act);
  }
  return result;
};


// strTgs.clTrim( removes spaces, converts to LOWER case
// this cleans up new values removes all spaces, makes them all lower case
exports.clTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-z0-9._\-][:]/gi, '');
    current = current.trim();
    current = current.toLowerCase();
    //logger.info('clTrim >'+current);
  }
  return current;
};


// strTgs.sTrim( - removes all spaces
// this cleans up new values removes all spaces
exports.sTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-z0-9._\-]/gi, '');
    current = current.trim();
    //logger.info('sTrim >'+current);
  }
  return current;
};

// strTgs.sTrim( - removes all spaces
// this cleans up new values removes all spaces
exports.stTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-z0-9.~_\-]/gi, '');
    current = current.trim();
    //logger.info('stTrim >'+current);
  }
  return current;
};

// strTgs.sTrim( - removes all spaces
// this cleans up new values removes all spaces
exports.stcTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-z0-9.,~_\- ]/gi, '');
    //logger.info('stTrim >'+current);
  }
  return current;
};
// strTgs.uTrim( - leaves spaces, trims
// this cleans up new values removes leading and trailing spaces but not inside spaces
exports.uTrim = function(current) {
  if (typeof current === 'undefined') {} else {
    current = current.replace(/[^a-z0-9._\- ][:]/gi, '');
    current = current.trim();
    //logger.info('uTrim >'+current);
  }
  return current;
};





// used everywhere
// this checks old and new values and removes unwanted char,
exports.uCleanUp = function(old, current) {
  //logger.info ('was>'+old);
  //logger.info ('now>'+current);
  if (old === '' && current == '') {
    //logger.info('uCleanup - old=== & new== ');
  } else if (typeof current === 'undefined') {
    //logger.info('uCleanup - typeof used');
  } else {
    //logger.info('uCleanup - current trim');
    current = exports.uTrim(current);
    current = current.trim();
  }
  return current;
};
// this checks old and new values and removes unwanted char, leaves spaces
exports.mCleanUp = function(old, current) {
  //logger.info ('was>'+old);
  //logger.info ('now>'+current);
  if (old === '' && current == '') {
    //logger.info('mCleanup - old=== & new== ');
  } else if (typeof current === 'undefined') {
    //logger.info('mCleanup - typeof used');
  } else {
    //logger.info('mCleanup - current trim');
    current = exports.mTrim(current);
  }
  return current;
};

// strTgs.clCleanUp(
// this checks old and new values and removes unwanted char, no space, all lower
exports.csCleanUp = function(old, current) {
  //logger.info ('was>'+old);
  //logger.info ('now>'+current);
  if (old === '' && current == '') {
    //logger.info('clCleanup - old=== & new== ');
  } else if (typeof current === 'undefined') {
    //logger.info('clCleanup - typeof used');
  } else {
    //logger.info('clCleanup - current trim');
    current = exports.csTrim(current);
  }
  return current;
};


// strTgs.clCleanUp(
// this checks old and new values and removes unwanted char, no space, all lower
exports.clCleanUp = function(old, current) {
  //logger.info ('was>'+old);
  //logger.info ('now>'+current);
  if (old === '' && current == '') {
    //logger.info('clCleanup - old=== & new== ');
  } else if (typeof current === 'undefined') {
    //logger.info('clCleanup - typeof used');
  } else {
    //logger.info('clCleanup - current trim');
    current = exports.clTrim(current);
  }
  return current;
};

// strTgs.cCleanUp(
// this checks old and new values and removes unwanted char, no space, all upper
exports.cCleanUp = function(old, current) {
  //logger.info ('was>'+old);
  //logger.info ('now>'+current);
  if (old === '' && current == '') {
    //logger.info('clCleanup - old=== & new== ');
  } else if (typeof current === 'undefined') {
    //logger.info('clCleanup - typeof used');
  } else {
    //logger.info('clCleanup - current trim');
    current = exports.cTrim(current);
  }
  return current;
};
// this checks old and new values and removes unwanted char, no space
exports.stCleanup = function(old, current) {
  //logger.info ('was>'+old);
  //logger.info ('now>'+current);
  if (old === '' && current == '') {
    //logger.info('stcCleanup - old=== & new== ');
  } else if (typeof current === 'undefined') {
    //logger.info('stcCleanup - typeof used');
  } else {
    //logger.info('stcCleanup - current trim');
    current = exports.stTrim(current);
  }
  return current;
};


// this checks old and new values and removes unwanted char, no space
exports.stcCleanup = function(old, current) {
  //logger.info ('was>'+old);
  //logger.info ('now>'+current);
  if (old === '' && current == '') {
    //logger.info('stcCleanup - old=== & new== ');
  } else if (typeof current === 'undefined') {
    //logger.info('stcCleanup - typeof used');
  } else {
    //logger.info('stcCleanup - current trim');
    current = exports.stcTrim(current);
  }
  return current;
};

// This cleans up a CSV array using uTrim ^^^
exports.csvCleanup = function(csv) {
  //logger.info('csvCleanup');
  csv = csv.split(',');
  var csvLen = csv.length;
  for (i = 0; i < csvLen; i++) {
    //logger.info('before >'+csv[i]);
    csv[i] = exports.uTrim(csv[i]);
    //logger.info('after  >'+csv[i]);
  }
  return csv;
};

// used in Equipment List
// takes a Equipment equipLocation value and removes everything after last _
exports.ruToLocation = function(ruToLoc) {
  if (!ruToLoc) {} else {
    var cutLine = ruToLoc.lastIndexOf('_');
    ruToLoc = ruToLoc.substring(0, cutLine);
    return ruToLoc;
  }
};

// returns a rack elevation (does the opposite of above)
exports.ruElevation = function(ruToLoc) {
  if (!ruToLoc) {} else {
    var cutLine = ruToLoc.lastIndexOf('_');
    ruToLoc = ruToLoc.slice(cutLine + 1);
    return ruToLoc;
  }
};

// location combiner cleans up input and puts them together unless
// the input is empty
exports.locComb = function(rack, ru) {
  var rackRu;
  if (!rack) {
    return null;
  }
  rack = exports.uTrim(rack);
  ru = exports.uTrim(ru);
  ru = exports.pad(ru);
  rackRu = rack + '_' + ru;
  return rackRu;
};

// location code destructing
exports.locDest = (locCode) => {
  var locSplit = {
    dcSite: 'na',
    dcCage: 'na',
    dcRack: 'na',
    dcRU: 'na',
  };
  if (!locCode) {
    return locSplit;
  }
  var locArr = locCode.split('_');
  locSplit = {
    dcSite: locArr[0],
    dcCage: locArr[1],
    dcRack: locArr[2],
    dcRU: locArr[3],
  };
  return locSplit;
};

exports.noteAdd = function(currentNote, newNote) {
  if (newNote) {
    if (currentNote) {
      result = currentNote + ' ' + newNote;
    } else {
      result = newNote;
    }
  } else {
    result = currentNote;
  }
  return result;
};

// adds a leadig 0 to numbers 1-9
exports.pad = function pad(d) {
  //logger.info(d + ' typeof '+typeof d);
  //logger.info('exports.pad v001');
  return (isNaN(Number(d))) ? d.toString() : (Number(d) === 0 || typeof d === 'undefined' || d === '') ? '00' : (d.toString().length < 2) ? '0' + d.toString() : d.toString();
};


// Multi is the string for what field to look for in the
// target db, e.g. if looking in Equipment for SN, it would be equipSN
// strTgs.findThisInThatMulti(sy.systemEquipSN,eqs,'equipSN');

exports.findThisInThatMulti = function(findThis, inThat, multi) {
  var newData, arrayPosition;
  if (!findThis) {
    newData = false;
  } else {
    // Get Index of object based on id value
    arrayPosition = inThat.map(function(arrayItem) {
      // Match our findThis to inThat Object
      return arrayItem[multi];
    }).indexOf(findThis);
    if (!inThat[arrayPosition]) {
      newData = false;
    } else if (multi === 'optListKey') {
      newData = inThat[arrayPosition].optListArray;
    } else {
      newData = inThat[arrayPosition];
    }
  }
  return newData;
};



//
exports.checkNull = function(check) {
  if (!check) {
    check = 1;
  }
  return check;
};


// gets DC abbr from location

exports.getDCfromLoc = function(location) {
  var dcabbr;
  if (!location) {
    dcabbr = '';
  } else {
    start = location.indexOf('_');
    dcabbr = location.substring(0, start);
  }
  //logger.info('getDCfromLoc >'+dcabbr);
  return dcabbr;
};


exports.findThisInThatNetwork = function(findThis, inThat) {
  var data;
  if (!findThis) {
    //logger.info('findThisInThat.findThis is null');
    data = false;
  } else {
    // Get Index of object based on id value
    //logger.info('findOne  >'+findThis);
    var arrayPosition = inThat.map(function(arrayItem) {
      // Match our findThis to inThat Object
      //logger.info('arrayItem >'+arrayItem.dcNetVlan);
      return Number(arrayItem.dcNetVlan);
    }).indexOf(Number(findThis));
    if (!inThat[arrayPosition]) {
      //logger.info('inThat[arrayPosition]'+inThat[arrayPosition]);
      data = false;
    } else {
      // Get our found Object
      data = inThat[arrayPosition];
    }
  }
  //logger.info('findThisInThatNetwork.return'+data);
  return data;
};


// takes a checkbox answer and returns true or false
exports.doCheckbox = function(answer) {
  /*   if(answer === true){
     answer = true;
    //logger.info('Checkbox is true');
     }else{
     answer = false;
    //logger.info('Checkbox is false');
     }
     return answer; */
  loger.info('doCheckbox v2');
  return (answer === true) ? answer = true : answer = false;
};

// uesd for checkboxes in Equipment, model is set to defalut as 'false' when created.
// the value is put in here, true returns 'checked' and nothing if false
// handlebars will display 'checked' if checked, nothing if false
exports.setCheckBox = function(startVal) {
  //logger.info('setCheckBox sV0>'+startVal);
  var newVal = '';
  return (startVal === true) ? newVal = 'checked' : newVal;
};



/* example of mongoose query Category.find({parentuid:catid}, null, {sort:{name:1}, skip:0, limit:20}, function(err, categories) {
          callback(err, categories);
        }); */

// used in Equipment List
// this compares TEST and returns HTML to color the VALUE.

exports.trueFalseIcon = function(test, value) {
  if (!value) {
    value = 'None';
  }
  if (test === true || test === 'In Service') {
    test = '<strong class="text-success">' + value + '</strong>';
  } else if (test === 'Recieved' || test === 'Spare' || test === 'Next Build' || test === 'Possible') {
    test = '<strong class="text-info">' + value + '</strong>';
  } else if (test === false || test === 'Damaged' || test === 'Missing') {
    test = '<strong class="text-danger">' + value + '</strong>';
  } else if (test === 'In Service with Issues' || test === 'Spare with issues' || test === 'Out for RMA' || test === 'Blocked') {
    test = '<strong class="text-warning">' + value + '</strong>';
  } else if (test === 'Build in Progress') {
    test = '<strong class="text-primary">' + value + '</strong>';
  } else {
    test = '<strong class="text-default">' + value + '</strong>';
  }
  return test;
};

exports.trueFalseD3 = function(test, value) {
  if (!value) {
    value = 'None';
  }
  if (test === true || test === 'In Service') {
    test = 'green';
  } else if (test === 'Recieved' || test === 'Spare' || test === 'Next Build' || test === 'Possible') {
    test = 'blue';
  } else if (test === false || test === 'Damaged' || test === 'Missing') {
    test = 'red';
  } else if (test === 'In Service with Issues' || test === 'Spare with issues' || test === 'Out for RMA' || test === 'Blocked') {
    test = 'black';
  } else if (test === 'Build in Progress') {
    test = 'lightblue';
  } else {
    test = 'white';
  }
  return test;
};
// this returns the color of equipment based on type
exports.equipTypeColor = function(equipType) {
  var color;
  switch (equipType) {
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
      //   case 'Full Rack':
      //       color = 'FFFFCC';
      //       break;
    default:
      color = '#E0E2E6';
      break;
  }
  //logger.info('equipTypeColor'+color);
  return color;
};

// This was never used but seems interesting, leaving it here for examples
exports.getFormIndex = function(formIndexAndPost) {
  var findX = formIndexAndPost.indexOf('-');
  var formPost;
  formPost.fpData = formIndexAndPost.substring(findX + 1);
  formPost.fpIndex = formIndexAndPost.substring(1, findX);
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
exports.convertMetersToFeet = function(req) {
  if (!req) {
    //logger.info('no cageInMeters');
  } else {
    var res = Math.round(req * 3.2808);
    return res;
  }

};

// this is used for the Datacenter list for showing the proper city
exports.arrayByType = function(db, dbq) {
  var dKey = dbq.dKey,
    dVal = dbq.dVal,
    dRet = dbq.dRet,
    k;
  var dbLen = db.length;
  for (k = dbLen - 1; k >= 0; --k) {
    //logger.info('*************** | '+ dKey + ' '+ dVal + ' ' + dRet + ' |  *****************');
    if (db[k][dbq.dKey] == [dbq.dVal]) {
      //logger.info(db[k][dRet] + ' 3');
      //logger.info('*************** | '+ dKey + ' '+ dVal + ' ' + dRet + ' 2 |  *****************');
      return db[k][dbq.dRet];

    }
  }
};

exports.findDCParent = function(child, dc) {
  var abbr;
  var dcLen = dc.length;
  for (i = 0; i < dcLen; i++) {
    if (dc[i].id == child) {
      abbr = dc[i].abbreviation;
    }
  }
  //logger.info('dc abbr > '+abbr);
  return abbr;
};

// Used in Racks
// this takes a dc.cage ID and converts it to cage code
exports.findCGParent = function(child, dc) {
  //logger.info('uber child: '+child);
  //logger.info('uber dc:    '+dc);
  if (!dc) return null;
  // takes single and makes it an array  or 'toarray'
  if (!dc.length) {
    dc = [dc];
  }
  var uber;
  var dcLen = dc.length;
  for (i = 0; i < dcLen; i++) {
    //logger.info('uber for i: '+dc[i].abbreviation);
    for (j = 0; j < dc[i].cages.length; j++) {
      if (dc[i].cages[j].id == child) {
        //logger.info('uber for j: '+dc[i].abbreviation);
        uber = {
          fullName: dc[i].fullName,
          abbreviation: dc[i].abbreviation,
          foundingCompany: dc[i].foundingCompany,
          powerNames: dc[i].powerNames,
          cageAbbreviation: dc[i].cages[j].cageAbbreviation,
          cageNickname: dc[i].cages[j].cageNickname,
          cageName: dc[i].cages[j].cageName,
        };
      }
    }
  }
  //logger.info('uber > '+uber);
  return uber;
};


exports.findOneCGParent = function(child, dc) {
  //logger.info('uber child: '+child);
  //logger.info('uber dc:    '+dc);
  var uber;
  var dcCageLen = dc.cages.length;
  for (j = 0; j < dcCageLen; j++) {
    if (dc.cages[j].id == child) {
      //logger.info('uber for j: '+dc.abbreviation);
      uber = {
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
/*
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
*/
exports.displayrUs = (rUs) => {

};
exports.addressCleaner = (dc) => {
  var full = '';
  if (typeof dc.address1 !== 'undefined') {
    full = dc.address1;
  }
  if (typeof dc.address2 !== 'undefined') {
    full = `${full}<br>${dc.address2}`;
  }
  if (typeof dc.address3 !== 'undefined') {
    full = `${full}<br>${dc.address3}`;
  }
  if (typeof dc.address4 !== 'undefined') {
    full = `${full}<br>${dc.address4}`;
  }
  // logger.info(full);
  return full;
};
