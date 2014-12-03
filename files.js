

var dirPath = '/models/';
var dirList = fileList(dirPath);
    /*context ={
        dirList: dirList.map(function(dL){
            return {
                filename: dL.files,
                filedata: dL.filesOut,
            };
    })};*/
    
    console.log("dirList typefo"+dirList + typeof dirList);
    res.render ('admin/models');
    }else{
    console.log("datacenter >"+req.params.datacenter);
    res.render ('admin/'+req.params.datacenter);
    }
};


    function fileList(p){
    var filesOut = [];
    var filesTemp = [];
    fs.readdir(p, function(err, files){
    if (err){
    console.log("fileList error"+err);
    }
    for(i=0;i<files.length;i++){
    console.log ("files i >"files[i]);
    filesOut[i] = fileRead(p,files[i]);
    }
    console.log("fileList > "+filesOut);  
    return filesOut;
    });
}

    function fileRead(p,dF){
    var filesAndData;
    console.log("p+dF >"+p+dF);
    fs.readFile(p+dF, function(err, file){
    if (err) throw err;

  /* var array = [];
    array = file.toString().split('\n');
    array = array.join(" <br> ");
    console.log("array"+array);
    */
    return file;
    });
        
}
