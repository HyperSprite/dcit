// This is for https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.10/clipboard.min.js
new Clipboard('.btn');

var macFormat;
var macPlusOne;
var macPlusMany;
var macTable;
var eachMac;
var toAdd;

macFormat = function (macString) {
  var mA = [];
  var mB = '';
  var newMacString;
  mA = macString.match(/([a-fA-F0-9]{2})/g);
  for (var i = 0; i < mA.length; i++) {
    mB = mB + mA[i];
    mB = (i < 5) ? mB + ':' : mB;
  }
  newMacString = mB.toUpperCase();
  return newMacString;
};

// this takes a MAC address with or without delimeters
macPlusOne = function (current) {
  var newCurrent = '';
  var mA = [];
  var mUni;
  var mNum;
  if (typeof current === 'undefined' || current === '') {
    return newCurrent;
  }
  // cleans out MAC address of delimeters and non 0-9a-f char
  mA = current.match(/([a-fA-F0-9]{2})/g);
  if (mA.length !== 6) {
    newCurrent = 'Not A MAC Address';
    return newCurrent;
  }
  mNum = parseInt(mA[3] + mA[4] + mA[5], 16);
  // adds X to the current
  mNum = mNum + 1;
  mUni = mNum.toString(16);
  mUni = mA[0] + mA[1] + mA[2] + mUni;
  newCurrent = macFormat(mUni);
  return newCurrent;
};

// Takes a single mac and creates an array of macs
macPlusMany = function (orgMac, count) {
  var macMany = [];
  var nextMac = orgMac;
  macMany[0] = macFormat(orgMac);
  for (var i = 1; i < count; i++) {
    macMany[i] = macPlusOne(nextMac);
    nextMac = macMany[i];
  }
  return macMany;
};


// takes an array of MACs and truns them into json
macTable = function (orgMac) {
  var macArray = macPlusMany(orgMac, 5);
  var macObj = {};
  var macToHTML;
  macObj = {
    macAddresses: [{
      name: 'e0',
      address: macArray[0],
    }, {
      name: 'e1',
      address: macArray[1],
    }, {
      name: 'e2',
      address: macArray[2],
    }, {
      name: 'e3',
      address: macArray[3],
    }, {
      name: 'ilom',
      address: macArray[4],
    }],
  };
  macToHTML = '<table>';
  for (var i = 0; i < 5; i++) {
    macToHTML += '<tr><td>' + macObj.macAddresses[i].name + '</td><td id="mac' + i + '">' + macObj.macAddresses[i].address + '</td><td><button class="btn btn-xs" data-clipboard-target="#mac' + i + '">Copy</button></td></tr>';
  }
  macToHTML += '</table>';
  return macToHTML;
};

$(document).ready(function () {
  $('button').click(function () {
    $('#messages').empty();
    toAdd = $('input[name=message]').val();
    $('#messages').append(macTable(toAdd));
  });
});
