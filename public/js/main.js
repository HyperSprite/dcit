
$(document).ready(function() {
  // to dissable location on equipment if equipment has parent
  $('#equipParent').blur(function(){
    if ($('#equipParent').val().length > 0) {
      $('#equipLocationRack').prop('disabled', true);
      $('#list-equipLocationRu').focus();
    } else {
      $('#equipLocationRack').prop('disabled', false);
      $('#equipLocationRack').focus();
    }
  });

  // https://github.com/devbridge/jQuery-Autocomplete
  $('.autofillEquipSN').autocomplete({
    serviceUrl: '/autocomplete/allEquipSN',
    minChars: 3,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
  });
  $('#equipSN').autocomplete({
    serviceUrl: '/autocomplete/allEquipSN',
    minChars: 3,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>',
  });
  $('#systemName').autocomplete({
    serviceUrl: '/autocomplete/allSystemNames',
    minChars: 3,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>',
  });
  $('#systemRole').autocomplete({
    serviceUrl: '/autocomplete/allSystemRole',
    minChars: 2,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
  });
  $('#systemEnviron').autocomplete({
    serviceUrl: '/autocomplete/allSystemEnviron',
    minChars: 2,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
  });
  $('#equipMake').autocomplete({
    serviceUrl: '/autocomplete/allEquipMake',
    minChars: 3,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
  });
  $('#equipModel').autocomplete({
    serviceUrl: '/autocomplete/allEquipModel',
    minChars: 3,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
  });
  $('#equipLocationRack').autocomplete({
    serviceUrl: '/autocomplete/allLocationRack',
    minChars: 3,
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
  });
  $('.autofillSystemName').autocomplete({
    serviceUrl: '/autocomplete/allSystemNames',
    minChars: 3,
    delimiter: ',',
    autoFocus: true,
    showNoSuggestionNotice: true,
    noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
  });
  $('.popup').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'), 'popupWindow', 'width=300,height=300,scrollbars=yes');
  });
  $("[id^='singlePortDelForm']").on('submit', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!confirm($(this).attr('data-confirm'))) {
      return false;
    }
    console.log($(this).find('input[name="subId"]').val());
    var subId = $(this).find('input[name="subId"]').val();
    var details = $(this).serialize();
    $.post('/process/singleportdelete', details, function(data) {})
      .done(function() {
        $('#' + subId).fadeOut('slow', function() {
          $(this).remove();
        });
      })
      .fail(function() {
        alert('Delete Failed');
      });
    return false;
  });
  $("a [id^='equipStatusEdit']").click(function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    // replace table cell with form
    // get /asset/equipstatusedit html ajax
  });

  $(document).on('focus', '.sysPortEndPointPlusOne', function() {
    $("[id^='sysPortEndPoint']").autocomplete({
      serviceUrl: '/autocomplete/allSystemNames',
      minChars: 3,
      autoFocus: true,
      showNoSuggestionNotice: true,
      noSuggestionNotice: '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>',
    });
  });

  $(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });

  $('.reportDrop').click(function() {
    var getUrl = '/utility/distinct/' + findIn + '/' + findWhat;
    $.ajax({
      url: getUrl,
      type: 'GET',
      dataType: 'json',
      success: function(jsonArray) {
        var newList = '';
        jsonArray.forEach(function(jsonRes) {
          newList += '<li><a href="/reports/' + findIn + '/' + findWhat + '/' + jsonRes + '">' + jsonRes + '</a></li>';
        });
        $(this).children('ul').html
      }


    })
  });

// form validation
//
// for this to work you need jquery-validate
// on the button or link you need a class = assetFormSubmit
// on the form you need a id = datacenterForm
//
// There is also some CSS for .error that makes it look good
//


  $('.assetFormSubmit').click(function() {
    if ($('#datacenterForm').valid()) {
      $('#datacenterForm').submit();
      return false; // prevent normal form posting
    }
  });
    $('input#timezone').val(jstz.determine().name());
    $('.noEnterSubmit').keypress(function(e) {
      if (e.which == 13) return false;
    });

  function mySystemEnviron(dSE) {
    var distSysEnviron = '';
    dSE.forEach(function(sE) {
      // console.log(`systemEnviron ${sE}`);
      // distSysEnviron += <li><a href="/reports/equipment/systemEnviron/${sE}">${sE}</a></li>`;
      distSysEnviron += '<li><a href="/reports/query?findIn=systemEnviron&findWhat=' + sE + '">' + sE + '</a></li>';
    });
    $("#systemEnvironDrop").append(distSysEnviron);
  }
  if ($("#systemEnvironDrop").length) {
    $("#systemEnvironDrop").ready(function() {
      $.get("/utility/distinct?findIn=Systemdb&findWhat=systemEnviron", mySystemEnviron);
    });
  }

  function mySystemRole(dSR) {
    var distSysRole = '';
    dSR.forEach(function(sR) {
      // console.log(`systemRole ${sR}`);
      // distSysRole += `<li><a href="/reports/equipment/systemRole/${sR}">${sR}</a></li>`;
      distSysRole += '<li><a href="/reports/query?findIn=systemRole&findWhat=' + sR + '">' + sR + '</a></li>';
    });
    $("#systemRoleDrop").append(distSysRole);
  }
  if ($("#systemRoleDrop").length) {
    $("#systemRoleDrop").ready(function() {
      $.get("/utility/distinct?findIn=Systemdb&findWhat=systemRole", mySystemRole);
    });
  }

  function myEquipMake(dEM) {
    var distEquipMake = '';
    dEM.forEach(function(eM) {
      // console.log(`equipMake ${eM}`);
      // distEquipMake += `<li><a href="/reports/equipment/equipMake/${eM}">${eM}</a></li>`;
      distEquipMake += '<li><a href="/reports/query?findIn=equipMake&findWhat=' + eM + '">' + eM + '</a></li>';
    });
    $("#equipMakeDrop").append(distEquipMake);
  }
  if ($("#equipMakeDrop").length) {
    $("#equipMakeDrop").ready(function() {
      $.get("/utility/distinct?findIn=Equipment&findWhat=equipMake", myEquipMake);
    });
  }
  // for nav search options dorp down
  $('.keep-open').on({
    "shown.bs.dropdown": function() { this.closable = false; },
    "click":             function() { this.closable = true; },
    "hide.bs.dropdown":  function() { return this.closable; }
  });
});
