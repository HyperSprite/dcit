// for reports formatting using Bootstrap-table

// need to work on this one
function equipLocationFormatter(value) {
  return '<a href="/reports/equipment/equipLocation/' + value.substring(0, value.length - 3) + '" target="_blank"> ' + value + '</a>';
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

function equipPONumFormatter(value) {
  return '<a href="/reports/equipment/equipPONum/' + value + '" target="_blank"> ' + value + '</a>';
}

function equipInvoiceFormatter(value) {
  return '<a href="/reports/equipment/equipInvoice/' + value + '" target="_blank"> ' + value + '</a>';
}


function equipProjectNumFormatter(value) {
  return '<a href="/reports//reports/equipment/equipProjectNum' + value + '" target="_blank"> ' + value + '</a>';
}
// equipLocationFormatter
// systemParentIdFormatter
// systemEnvironFormatter
// systemRoleFormatter
// systemTicketFormatter
// equipSNFormatter
// equipAcquisitionFormatter
// equipPONumFormatter
// equipInvoiceFormatter
// equipProjectNumFormatter
