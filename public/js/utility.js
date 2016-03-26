var utilityData;
var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (xhr.status === 200) {
      utilityData = JSON.parse(xhr.responseText);
    }
  };
xhr.open('GET', '/utility', true);
xhr.send(null);
