macFormat = function(macString){
        var mA=[],mB='';
        mA = macString.match(/([a-fA-F0-9]{2})/g);
        for (var i=0;i<mA.length;i++) {
           mB = mB+mA[i];
           mB = (i<5) ? mB+':': mB;
        }
        macString = mB.toUpperCase();
        return macString;
}

// this takes a MAC address with or without delimeters 
macPlusOne = function(current){
    if (typeof current === 'undefined' || current === ''){
        current = '';    
    }else{
        var mA=[];
// cleans out MAC address of delimeters and non 0-9a-f char
        mA = current.match(/([a-fA-F0-9]{2})/g);
        if (mA.length !== 6){
            current = 'Not A MAC Address';
        }else{
        var mUni = mA[3]+mA[4]+mA[5];
        var mNum = parseInt(mA[3]+mA[4]+mA[5], 16);
// adds X to the current 
        mNum = mNum +1;
        var mUni2 = mNum.toString(16);
        mUni2 = mA[0]+mA[1]+mA[2]+mUni2;
        current = macFormat(mUni2);
    }}
    return current;
};
// Takes a single mac and creates an array of macs
macPlusMany = function(orgMac,count){
    var macMany = [],
        nextMac=orgMac;
    macMany[0]=macFormat(orgMac);
    for(i=1;i<count;i++){
        macMany[i] = macPlusOne(nextMac);
        nextMac = macMany[i];
    }
    return macMany;
};

// takes an array of MACs and truns them into json
jsonMacs = function(orgMac){
    macArray = macPlusMany(orgMac,5);
    macJson={};
    macJson={"macAddresses":[
        {"name":"e0","address":macArray[0]},
        {"name":"e1","address":macArray[1]},
        {"name":"e2","address":macArray[2]},
        {"name":"e3","address":macArray[3]},
        {"name":"ilom","address":macArray[4]}
        ]};
    return macJson;
};


$(document).ready(function() {

$('.popup').click(function(event) {
    event.preventDefault();
    window.open($(this).attr("href"), "popupWindow", "width=300,height=300,scrollbars=yes");
});

    $('button').click(function() {
        $('#messages').empty();
        var toAdd = $("input[name=message]").val();
        // works to add 1 mac 
        //var eachMac = macPlusOne(toAdd);
        // works to create array of MACs
        //var eachMac = macPlusMany(toAdd,5);
        //toAdd = xFourMacs(toAdd);
        //$.each(toAdd, function (index, item){
        //    var eachMac = item[1] + ' ' + item[2];
        var eachMac = jsonMacs(toAdd)

        //$('#messages').append('<p>'+eachMac+'</p>');
        $('#messages').append('<p>'+eachMac.macAddresses[0].name+' : '+eachMac.macAddresses[0].address+'<br>'+eachMac.macAddresses[1].name+' : '+eachMac.macAddresses[1].address+'<br>'+eachMac.macAddresses[2].name+' : '+eachMac.macAddresses[2].address+'<br>'+eachMac.macAddresses[3].name+' : '+eachMac.macAddresses[3].address+'<br>'+eachMac.macAddresses[4].name+' : '+eachMac.macAddresses[4].address+'</p>');
        //});
    });
});