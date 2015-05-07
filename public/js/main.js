// https://github.com/devbridge/jQuery-Autocomplete

$(document).ready(function(){
        
        $('#systemEquipSN').autocomplete({
            serviceUrl: '/autocomplete/allEquipSN',
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'            
        });
        $('#equipSN').autocomplete({
            serviceUrl: '/autocomplete/allEquipSN',
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>',
        });
        $('#systemName').autocomplete({
            serviceUrl: '/autocomplete/allSystemNames',
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>',

        });
        $('#systemRole').autocomplete({
            serviceUrl: '/autocomplete/allSystemRole',
            minChars: 2,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'
        });
        $('#systemEnviron').autocomplete({
            serviceUrl: '/autocomplete/allSystemEnviron',
            minChars: 2,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'
        });
        $('#equipMake').autocomplete({
            serviceUrl: '/autocomplete/allEquipMake',
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'    
        });
        $('#equipModel').autocomplete({
            serviceUrl: '/autocomplete/allEquipModel',
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'            
        });
        $('#equipLocationRack').autocomplete({
            serviceUrl: '/autocomplete/allLocationRack',
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'            
        });
        $("[id^='sysPortEndPoint']").autocomplete({
            serviceUrl: "/autocomplete/allSystemNames",
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'            
        });


    $(document).on('focus','.sysPortEndPointPlusOne',function(){
            $("[id^='sysPortEndPoint']").autocomplete({
            serviceUrl: "/autocomplete/allSystemNames",
            minChars: 3,
            autoFocus:true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>'            
        });  
    });
});        

