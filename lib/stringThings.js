//this file takes 4 address lines and combines them
// used first in locations.js to handle pulling in the 4 address lines.


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
}