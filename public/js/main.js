    $(document).ready(function(){
        $("[id^='sysPortEndPoint']").autocomplete({
            serviceUrl: "/autocomplete/allSystemNames",
            minChars: 3,
            autoFocus:true,
        });              
        $('#systemEquipSN').autocomplete({
            serviceUrl: '/autocomplete/allEquipSN',
            minChars: 3,
            autoFocus:true,
        });
        $('#systemRole').autocomplete({
            serviceUrl: '/autocomplete/allSystemRole',
            minChars: 2,
            autoFocus:true,
        });
            $('#systemEnviron').autocomplete({
            serviceUrl: '/autocomplete/allSystemEnviron',
            minChars: 2,
            autoFocus:true,
        });
        $('#equipMake').autocomplete({
            serviceUrl: '/autocomplete/allEquipMake',
            minChars: 3,
            autoFocus:true,
        });
        $('#equipModel').autocomplete({
            serviceUrl: '/autocomplete/allEquipModel',
            minChars: 3,
            autoFocus:true,
        });
        $('#equipLocationRack').autocomplete({
            serviceUrl: '/autocomplete/allLocationRack',
            minChars: 3,
            autoFocus:true,
        });
    });
