// Render an option tag's value and selected attributes
Handlebars.registerHelper("option", function (current, field) {
  current = hbs.Utils.escapeExpression(current);
  field = hbs.Utils.escapeExpression(field);
  var results = 'value="' + current + '" ' + (field === current ? 'selected="selected"' : "");
  return new hbs.SafeString(results);
});