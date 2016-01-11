// https://github.com/devbridge/jQuery-Autocomplete

$(document).ready(function() {
  $('#systemEquipSN').autocomplete({
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
});

$(function() {
  $('table.table-sort').tablesort(); // http://www.jqueryscript.net/table/jQuery-Plugin-For-Sortable-Searchable-Tables-Tablesort.html
  });

  $('input#timezone').val(jstz.determine().name());
  $('.noEnterSubmit').keypress(function(e) {
    if (e.which == 13) return false;
  });
