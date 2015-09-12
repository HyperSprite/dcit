// not in use at this time

function addField(area,field,limit) {
    var count;
    if(!document.getElementById) return;
    var field_area = document.getElementById(area);  
    var liList = document.getElementById(area).getElementsByTagName("tr");
    var count = liList.length

    /*var count = count + 1;*/
    if (isNaN===count)count=0;
    //If the maximum number of elements have been reached, exit the function.
    //      If the given limit is lower than 0, infinite number of fields can be created.
    if(count > limit && limit > 0) return;
    
    if(document.createElement) { 
         //Older Method
        field_area.insertAdjacentHTML('beforeend', plus1);
    }
    
}