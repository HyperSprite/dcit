// for reports formatting using Bootstrap-table
// Note: this is browser side, don't 'update' to template strings
// until project moved to babel transpiling.

function equipLocationFormatter(value) {
  if (value) {
    return '<a href="/equipment-systems/' + value.substring(0, value.length - 3) + '" target="_blank"> ' + value + '</a>';
  }
  return '-';
}

function systemNameFormatter(value) {
  var sysDisp = '<a href="/system/' + value + '" target="_blank"> <strong>' + value + '</strong></a>';
  if (utilityData === null) {
    return sysDisp;
  } else if (utilityData.user.edit === 1 && value.length > 0) {
    var sysEdit = '<a href="/system/' + value + '/edit" target="_blank"> <span class="glyphicon glyphicon-edit glyphicon-danger" title="Edit ' + value + '"></span></a>';
    sysDisp = sysEdit + sysDisp;
  }
  return sysDisp;
}

function systemParentIdFormatter(value) {
  return '<a href="/system/' + value + '" target="_blank"> ' + value + '</a>';
}

function systemEnvironFormatter(value) {
  var sysDisp = '<a href="/reports/systems/systemEnviron/' + value + '" target="_blank"> ' + value + '</a>';
  return sysDisp;
}

function systemRoleFormatter(value) {
  return '<a href="/reports/systems/systemRole/' + value + '" target="_blank"> ' + value + '</a>';
}

function systemTicketFormatter(value) {
  return '<a href="/reports/multi-?searchIn=system~systemTicket&searchFor=' + value + '" target="_blank"> ' + value + '</a>';
}

function equipSNFormatter(value) {
  var equipDisp = '<a href="/equipment/' + value + '" target="_blank"> <strong>' + value + '</strong></a>';
  if (utilityData === null) {
    return equipDisp;
  } else if (utilityData.user.edit === 1 && value.length > 0) {
    var equipEdit = '<a href="/equipment/' + value + '/edit" target="_blank"> <span class="glyphicon glyphicon-edit glyphicon-danger" title="Edit ' + value + '"></span></a>';
    equipDisp = equipEdit + equipDisp;
  }
  return equipDisp;
}

function equipStatusFormatter(value) {
  if (value === 'In Service') {
    return '<span class="glyphicon glyphicon-ok-circle glyphicon-success"></span> ' + value;
  }
  if (value === 'In Service with issues') {
    return '<span class="glyphicon glyphicon-warning-sign glyphicon-warning"></span> ' + value;
  }
  return value;
}

function equipPONumFormatter(value) {
  return '<a href="/reports/equipment/equipPONum/' + value + '" target="_blank"> ' + value + '</a>';
}

function equipInvoiceFormatter(value) {
  return '<a href="/reports/equipment/equipInvoice/' + value + '" target="_blank"> ' + value + '</a>';
}


function equipProjectNumFormatter(value) {
  return '<a href="/reports//reports/equipment/equipProjectNum' + value + '" target="_blank"> ' + value + '</a>';
}

function equipMakeFormatter(value) {
  return '<a href="/reports//reports/equipment/equipMake' + value + '" target="_blank"> ' + value + '</a>';
}


function equipModelWithSubsFormatter(value) {
  var valMkMod = value;
  if (value.length > 42) {
    valMkMod = value.substring(0, 39) + '...';
  }
  return valMkMod;
}

function equipAcquisitionFormatter(value) {
  var newVal = moment(value).format('YYYY[-]MM[-]DD');
  var testVal30 = moment(value).add(30, 'months');
  var testVal36 = moment(value).add(36, 'months');
  if (newVal === 'Invalid date') {
    return '-';
  }
  if (testVal36 < moment()) {
    return '<span class="glyphicon glyphicon-exclamation-sign glyphicon-danger"></span><span class="text-danger"><strong> ' + newVal + '</strong></span>';
  }
  if (testVal30 < moment()) {
    return '<span class="glyphicon glyphicon-warning-sign glyphicon-warning"></span><strong> ' + newVal + '</strong>';
  }
  return '<span class="glyphicon glyphicon-ok-circle glyphicon-success"></span> ' + newVal;
}
